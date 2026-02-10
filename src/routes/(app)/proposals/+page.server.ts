import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const proposals = await db.proposalGroup.findMany({
		where: { hostUserId: locals.user!.id },
		orderBy: { createdAt: 'desc' },
		include: {
			slots: true,
			_count: { select: { appointments: true } }
		}
	});

	return { proposals };
};
