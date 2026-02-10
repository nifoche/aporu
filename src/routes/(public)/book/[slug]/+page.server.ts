import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq, and, gte, lt, ne, sql } from 'drizzle-orm';
import { getDB } from '$lib/server/db';
import { bookingPages, users, appointments } from '$lib/server/db/schema';

interface TimeSlot {
	start: string;
	end: string;
	date: string;
}

function generateAvailableSlots(
	availableHours: Record<string, Array<{ start: string; end: string }>>,
	duration: number,
	bufferBefore: number,
	bufferAfter: number,
	minNotice: number,
	maxDaysAhead: number,
	existingAppointments: Array<{ startTime: string; endTime: string }>
): TimeSlot[] {
	const slots: TimeSlot[] = [];
	const now = new Date();
	const minTime = new Date(now.getTime() + minNotice * 60 * 1000);
	const maxDate = new Date(now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000);

	const dayMap: Record<number, string> = {
		0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat'
	};

	for (let d = new Date(now); d <= maxDate; d.setDate(d.getDate() + 1)) {
		const dayKey = dayMap[d.getDay()];
		const dayHours = availableHours[dayKey];
		if (!dayHours) continue;

		for (const range of dayHours) {
			const [startH, startM] = range.start.split(':').map(Number);
			const [endH, endM] = range.end.split(':').map(Number);

			const slotStart = new Date(d);
			slotStart.setHours(startH, startM, 0, 0);

			const rangeEnd = new Date(d);
			rangeEnd.setHours(endH, endM, 0, 0);

			while (true) {
				const actualStart = new Date(slotStart.getTime() + bufferBefore * 60 * 1000);
				const actualEnd = new Date(actualStart.getTime() + duration * 60 * 1000);
				const withBuffer = new Date(actualEnd.getTime() + bufferAfter * 60 * 1000);

				if (withBuffer > rangeEnd) break;
				if (actualStart < minTime) {
					slotStart.setMinutes(slotStart.getMinutes() + 30);
					continue;
				}

				// Check for conflicts with existing appointments
				const hasConflict = existingAppointments.some(apt => {
					const aptStart = new Date(apt.startTime);
					const aptEnd = new Date(apt.endTime);
					return actualStart < aptEnd && actualEnd > aptStart;
				});

				if (!hasConflict) {
					slots.push({
						date: actualStart.toISOString().split('T')[0],
						start: actualStart.toTimeString().slice(0, 5),
						end: actualEnd.toTimeString().slice(0, 5)
					});
				}

				slotStart.setMinutes(slotStart.getMinutes() + 30);
			}
		}
	}

	return slots;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDB(platform);

	// Get booking page with user
	const bookingPageResult = await db
		.select({
			bookingPage: bookingPages,
			user: users
		})
		.from(bookingPages)
		.leftJoin(users, eq(bookingPages.userId, users.id))
		.where(eq(bookingPages.slug, params.slug))
		.limit(1)
		.all();

	if (bookingPageResult.length === 0 || !bookingPageResult[0].bookingPage.isActive) {
		error(404, 'この予約ページは見つかりません');
	}

	const { bookingPage, user } = bookingPageResult[0];

	// Get existing appointments
	const nowIso = new Date().toISOString();
	const existingAppointments = await db
		.select({ startTime: appointments.startTime, endTime: appointments.endTime })
		.from(appointments)
		.where(
			and(
				eq(appointments.bookingPageId, bookingPage.id),
				ne(appointments.status, 'cancelled'),
				gte(appointments.startTime, nowIso)
			)
		)
		.all();

	const availableHours = JSON.parse(bookingPage.availableHours);

	const availableSlots = generateAvailableSlots(
		availableHours,
		bookingPage.duration,
		bookingPage.bufferBefore,
		bookingPage.bufferAfter,
		bookingPage.minNotice,
		bookingPage.maxDaysAhead,
		existingAppointments
	);

	// Group by date
	const slotsByDate: Record<string, TimeSlot[]> = {};
	for (const slot of availableSlots) {
		if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
		slotsByDate[slot.date].push(slot);
	}

	return {
		bookingPage: {
			title: bookingPage.title,
			description: bookingPage.description,
			duration: bookingPage.duration,
			slug: bookingPage.slug,
			hostName: user?.name || '不明'
		},
		slotsByDate
	};
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		const db = getDB(platform);
		const formData = await request.formData();
		const date = formData.get('date')?.toString();
		const startTime = formData.get('startTime')?.toString();
		const guestName = formData.get('guestName')?.toString().trim();
		const guestEmail = formData.get('guestEmail')?.toString().trim();
		const guestCompany = formData.get('guestCompany')?.toString().trim() || null;
		const notes = formData.get('notes')?.toString().trim() || null;

		if (!date || !startTime || !guestName || !guestEmail) {
			return fail(400, { error: '必須項目を入力してください' });
		}

		const bookingPageResult = await db
			.select()
			.from(bookingPages)
			.where(eq(bookingPages.slug, params.slug))
			.limit(1)
			.get();

		if (!bookingPageResult || !bookingPageResult.isActive || !bookingPageResult.userId) {
			return fail(404, { error: '予約ページが見つかりません' });
		}

		const bookingPage = bookingPageResult;

		const [startH, startM] = startTime.split(':').map(Number);
		const appointmentStart = new Date(date);
		appointmentStart.setHours(startH, startM, 0, 0);
		const appointmentEnd = new Date(appointmentStart.getTime() + bookingPage.duration * 60 * 1000);

		// Double-check for conflicts
		const conflict = await db
			.select()
			.from(appointments)
			.where(
				and(
					eq(appointments.bookingPageId, bookingPage.id),
					ne(appointments.status, 'cancelled'),
					lt(appointments.startTime, appointmentEnd.toISOString()),
					gte(sql`datetime(${appointments.endTime})`, appointmentStart.toISOString())
				)
			)
			.limit(1)
			.get();

		if (conflict) {
			return fail(409, { error: 'この時間帯は既に予約されています。別の時間帯をお選びください。' });
		}

		const now = new Date().toISOString();
		await db.insert(appointments).values({
			id: crypto.randomUUID(),
			type: 'booking',
			bookingPageId: bookingPage.id,
			hostUserId: bookingPage.userId,
			guestName,
			guestEmail,
			guestCompany: guestCompany ?? undefined,
			startTime: appointmentStart.toISOString(),
			endTime: appointmentEnd.toISOString(),
			status: 'confirmed',
			notes: notes ?? undefined,
			createdAt: now,
			updatedAt: now
		});

		redirect(302, `/book/${params.slug}/complete`);
	}
};
