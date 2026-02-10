import type { PageServerLoad } from './$types';
import { eq, and, gte, lt, asc, desc } from 'drizzle-orm';
import { getDB } from '$lib/server/db';
import { appointments } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url, platform }) => {
	const db = getDB(platform);
	const filter = url.searchParams.get('filter') || 'upcoming';
	const userId = locals.user!.id;
	const now = new Date().toISOString();

	let whereCondition;

	if (filter === 'upcoming') {
		whereCondition = and(
			eq(appointments.hostUserId, userId),
			gte(appointments.startTime, now),
			eq(appointments.status, 'confirmed')
		);
	} else if (filter === 'past') {
		whereCondition = and(
			eq(appointments.hostUserId, userId),
			lt(appointments.startTime, now)
		);
	} else if (filter === 'cancelled') {
		whereCondition = and(
			eq(appointments.hostUserId, userId),
			eq(appointments.status, 'cancelled')
		);
	} else {
		whereCondition = eq(appointments.hostUserId, userId);
	}

	const appointmentsResult = await db
		.select()
		.from(appointments)
		.where(whereCondition!)
		.orderBy(filter === 'past' ? desc(appointments.startTime) : asc(appointments.startTime))
		.limit(50)
		.all();

	return { appointments: appointmentsResult, filter };
};
