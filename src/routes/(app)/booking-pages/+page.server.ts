import type { PageServerLoad } from './$types';
import { eq, desc, count } from 'drizzle-orm';
import { getDB } from '$lib/server/db';
import { bookingPages, appointments } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getDB(platform);

	const result = await db
		.select({
			bookingPage: bookingPages,
			_count: count(appointments.id)
		})
		.from(bookingPages)
		.leftJoin(appointments, eq(bookingPages.id, appointments.bookingPageId))
		.where(eq(bookingPages.userId, locals.user!.id))
		.orderBy(desc(bookingPages.createdAt))
		.all();

	// Group by booking page and aggregate counts
	const bookingPagesMap = new Map();
	for (const row of result) {
		const id = row.bookingPage.id;
		if (!bookingPagesMap.has(id)) {
			bookingPagesMap.set(id, {
				...row.bookingPage,
				_count: { appointments: 0 }
			});
		}
		if (row._count) {
			bookingPagesMap.get(id)._count.appointments++;
		}
	}

	return { bookingPages: Array.from(bookingPagesMap.values()) };
};
