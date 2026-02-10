import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	const filter = url.searchParams.get('filter') || 'upcoming';
	const userId = locals.user!.id;

	const where: Record<string, unknown> = { hostUserId: userId };

	if (filter === 'upcoming') {
		where.startTime = { gte: new Date() };
		where.status = 'confirmed';
	} else if (filter === 'past') {
		where.startTime = { lt: new Date() };
	} else if (filter === 'cancelled') {
		where.status = 'cancelled';
	}

	const appointments = await db.appointment.findMany({
		where,
		orderBy: { startTime: filter === 'past' ? 'desc' : 'asc' },
		take: 50
	});

	return { appointments, filter };
};
