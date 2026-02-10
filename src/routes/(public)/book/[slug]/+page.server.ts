import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';

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
	existingAppointments: Array<{ startTime: Date; endTime: Date }>
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
					return actualStart < apt.endTime && actualEnd > apt.startTime;
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

export const load: PageServerLoad = async ({ params }) => {
	const bookingPage = await db.bookingPage.findUnique({
		where: { slug: params.slug },
		include: {
			user: { select: { name: true, email: true, avatarUrl: true } }
		}
	});

	if (!bookingPage || !bookingPage.isActive) {
		error(404, 'この予約ページは見つかりません');
	}

	const existingAppointments = await db.appointment.findMany({
		where: {
			bookingPageId: bookingPage.id,
			status: { not: 'cancelled' },
			startTime: { gte: new Date() }
		},
		select: { startTime: true, endTime: true }
	});

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
			hostName: bookingPage.user?.name || '不明'
		},
		slotsByDate
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
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

		const bookingPage = await db.bookingPage.findUnique({
			where: { slug: params.slug }
		});

		if (!bookingPage || !bookingPage.isActive || !bookingPage.userId) {
			return fail(404, { error: '予約ページが見つかりません' });
		}

		const [startH, startM] = startTime.split(':').map(Number);
		const appointmentStart = new Date(date);
		appointmentStart.setHours(startH, startM, 0, 0);
		const appointmentEnd = new Date(appointmentStart.getTime() + bookingPage.duration * 60 * 1000);

		// Double-check for conflicts
		const conflict = await db.appointment.findFirst({
			where: {
				bookingPageId: bookingPage.id,
				status: { not: 'cancelled' },
				startTime: { lt: appointmentEnd },
				endTime: { gt: appointmentStart }
			}
		});

		if (conflict) {
			return fail(409, { error: 'この時間帯は既に予約されています。別の時間帯をお選びください。' });
		}

		await db.appointment.create({
			data: {
				type: 'booking',
				bookingPageId: bookingPage.id,
				hostUserId: bookingPage.userId,
				guestName,
				guestEmail,
				guestCompany,
				startTime: appointmentStart,
				endTime: appointmentEnd,
				status: 'confirmed',
				notes
			}
		});

		redirect(302, `/book/${params.slug}/complete`);
	}
};
