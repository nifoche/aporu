import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq, asc } from 'drizzle-orm';
import { getDB } from '$lib/server/db';
import { proposalGroups, proposalSlots, users, appointments } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDB(platform);

	// Get proposal with host user
	const proposalResult = await db
		.select({
			proposal: proposalGroups,
			hostUser: users
		})
		.from(proposalGroups)
		.leftJoin(users, eq(proposalGroups.hostUserId, users.id))
		.where(eq(proposalGroups.slug, params.slug))
		.limit(1)
		.all();

	if (proposalResult.length === 0) {
		error(404, 'このページは見つかりません');
	}

	const { proposal, hostUser } = proposalResult[0];

	if (proposal.status !== 'pending') {
		return {
			proposal: {
				title: proposal.title,
				status: proposal.status,
				hostName: hostUser?.name || '不明',
				duration: proposal.duration,
				location: proposal.location,
				notes: proposal.notes
			},
			slots: [],
			alreadyConfirmed: true
		};
	}

	// Get slots for this proposal
	const slots = await db
		.select()
		.from(proposalSlots)
		.where(eq(proposalSlots.proposalGroupId, proposal.id))
		.orderBy(asc(proposalSlots.startTime))
		.all();

	return {
		proposal: {
			title: proposal.title,
			status: proposal.status,
			hostName: hostUser?.name || '不明',
			duration: proposal.duration,
			location: proposal.location,
			notes: proposal.notes
		},
		slots: slots.map(s => ({
			id: s.id,
			startTime: s.startTime,
			endTime: s.endTime
		})),
		alreadyConfirmed: false
	};
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		const db = getDB(platform);
		const formData = await request.formData();
		const slotId = formData.get('slotId')?.toString();
		const guestName = formData.get('guestName')?.toString().trim();
		const guestEmail = formData.get('guestEmail')?.toString().trim();
		const guestCompany = formData.get('guestCompany')?.toString().trim() || null;

		if (!slotId || !guestName || !guestEmail) {
			return fail(400, { error: '必須項目を入力してください' });
		}

		// Get proposal with slots
		const proposalResult = await db
			.select()
			.from(proposalGroups)
			.where(eq(proposalGroups.slug, params.slug))
			.limit(1)
			.get();

		if (!proposalResult || proposalResult.status !== 'pending') {
			return fail(400, { error: 'この日程調整は既に確定済みまたは無効です' });
		}

		const proposal = proposalResult;

		const slots = await db
			.select()
			.from(proposalSlots)
			.where(eq(proposalSlots.proposalGroupId, proposal.id))
			.all();

		const selectedSlot = slots.find(s => s.id === slotId);
		if (!selectedSlot) {
			return fail(400, { error: '選択された候補が見つかりません' });
		}

		const now = new Date().toISOString();

		// Execute updates in sequence (D1 has limited transaction support)
		await db.update(proposalSlots)
			.set({ isSelected: true })
			.where(eq(proposalSlots.id, slotId));

		await db.update(proposalGroups)
			.set({
				status: 'confirmed',
				guestName,
				guestEmail,
				updatedAt: now
			})
			.where(eq(proposalGroups.id, proposal.id));

		await db.insert(appointments).values({
			id: crypto.randomUUID(),
			type: 'proposal',
			proposalGroupId: proposal.id,
			hostUserId: proposal.hostUserId,
			guestName,
			guestEmail,
			guestCompany: guestCompany ?? undefined,
			startTime: selectedSlot.startTime,
			endTime: selectedSlot.endTime,
			status: 'confirmed',
			location: proposal.location ?? undefined,
			createdAt: now,
			updatedAt: now
		});

		redirect(302, `/p/${params.slug}/complete`);
	}
};
