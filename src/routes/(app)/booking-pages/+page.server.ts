import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const bookingPages = await db.bookingPage.findMany({
		where: { userId: locals.user!.id },
		orderBy: { createdAt: 'desc' },
		include: {
			_count: { select: { appointments: true } }
		}
	});

	return { bookingPages };
};
