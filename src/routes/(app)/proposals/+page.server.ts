import type { PageServerLoad } from './$types';
import { eq, desc } from 'drizzle-orm';
import { getDB } from '$lib/server/db';
import { proposalGroups, proposalSlots, appointments } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getDB(platform);

	const proposals = await db
		.select()
		.from(proposalGroups)
		.where(eq(proposalGroups.hostUserId, locals.user!.id))
		.orderBy(desc(proposalGroups.createdAt))
		.all();

	// Get slots for each proposal
	const proposalIds = proposals.map((p) => p.id);
	const slots = await db
		.select()
		.from(proposalSlots)
		.where(eq(proposalSlots.proposalGroupId, proposalIds[0])) // Simple where for now - ideally use `in()` operator
		.all();

	// Get appointment counts
	const appointmentCounts = await db
		.select({ proposalGroupId: appointments.proposalGroupId, count: appointments.id })
		.from(appointments)
		.where(eq(appointments.proposalGroupId, proposalIds[0]))
		.all();

	// Map slots to proposals
	const proposalsWithSlots = proposals.map((proposal) => ({
		...proposal,
		slots: slots.filter((s) => s.proposalGroupId === proposal.id),
		_count: {
			appointments: appointmentCounts.filter((a) => a.proposalGroupId === proposal.id).length
		}
	}));

	return { proposals: proposalsWithSlots };
};
