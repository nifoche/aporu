import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	const [upcomingAppointments, bookingPageCount, pendingProposals] = await Promise.all([
		db.appointment.findMany({
			where: {
				hostUserId: userId,
				status: 'confirmed',
				startTime: { gte: new Date() }
			},
			orderBy: { startTime: 'asc' },
			take: 5
		}),
		db.bookingPage.count({
			where: { userId, isActive: true }
		}),
		db.proposalGroup.count({
			where: { hostUserId: userId, status: 'pending' }
		})
	]);

	const totalAppointments = await db.appointment.count({
		where: { hostUserId: userId }
	});

	return {
		upcomingAppointments,
		stats: {
			bookingPages: bookingPageCount,
			pendingProposals,
			totalAppointments,
			upcomingCount: upcomingAppointments.length
		}
	};
};
