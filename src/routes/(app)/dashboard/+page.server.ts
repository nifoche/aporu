import type { PageServerLoad } from './$types';
import { eq, and, gte, asc, count, sql } from 'drizzle-orm';
import { getDB } from '$lib/server/db';
import { appointments, bookingPages, proposalGroups } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getDB(platform);
	const userId = locals.user!.id;
	const now = new Date().toISOString();

	const [upcomingAppointments, bookingPageResult, pendingProposalResult] = await Promise.all([
		db.select()
			.from(appointments)
			.where(
				and(
					eq(appointments.hostUserId, userId),
					eq(appointments.status, 'confirmed'),
					gte(appointments.startTime, now)
				)
			)
			.orderBy(asc(appointments.startTime))
			.limit(5),
		db.select({ count: count() })
			.from(bookingPages)
			.where(and(eq(bookingPages.userId, userId), eq(bookingPages.isActive, true)))
			.then(rows => rows[0]),
		db.select({ count: count() })
			.from(proposalGroups)
			.where(and(eq(proposalGroups.hostUserId, userId), eq(proposalGroups.status, 'pending')))
			.then(rows => rows[0])
	]);

	const totalAppointmentsResult = await db.select({ count: count() })
		.from(appointments)
		.where(eq(appointments.hostUserId, userId))
		.then(rows => rows[0]);

	return {
		upcomingAppointments,
		stats: {
			bookingPages: bookingPageResult.count,
			pendingProposals: pendingProposalResult.count,
			totalAppointments: totalAppointmentsResult.count,
			upcomingCount: upcomingAppointments.length
		}
	};
};
