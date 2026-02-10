import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
	const proposal = await db.proposalGroup.findUnique({
		where: { slug: params.slug },
		include: {
			slots: { orderBy: { startTime: 'asc' } },
			hostUser: { select: { name: true } }
		}
	});

	if (!proposal) {
		error(404, 'このページは見つかりません');
	}

	if (proposal.status !== 'pending') {
		return {
			proposal: {
				title: proposal.title,
				status: proposal.status,
				hostName: proposal.hostUser.name,
				duration: proposal.duration,
				location: proposal.location,
				notes: proposal.notes
			},
			slots: [],
			alreadyConfirmed: true
		};
	}

	return {
		proposal: {
			title: proposal.title,
			status: proposal.status,
			hostName: proposal.hostUser.name,
			duration: proposal.duration,
			location: proposal.location,
			notes: proposal.notes
		},
		slots: proposal.slots.map(s => ({
			id: s.id,
			startTime: s.startTime.toISOString(),
			endTime: s.endTime.toISOString()
		})),
		alreadyConfirmed: false
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const slotId = formData.get('slotId')?.toString();
		const guestName = formData.get('guestName')?.toString().trim();
		const guestEmail = formData.get('guestEmail')?.toString().trim();
		const guestCompany = formData.get('guestCompany')?.toString().trim() || null;

		if (!slotId || !guestName || !guestEmail) {
			return fail(400, { error: '必須項目を入力してください' });
		}

		const proposal = await db.proposalGroup.findUnique({
			where: { slug: params.slug },
			include: { slots: true }
		});

		if (!proposal || proposal.status !== 'pending') {
			return fail(400, { error: 'この日程調整は既に確定済みまたは無効です' });
		}

		const selectedSlot = proposal.slots.find(s => s.id === slotId);
		if (!selectedSlot) {
			return fail(400, { error: '選択された候補が見つかりません' });
		}

		// Update proposal and create appointment in a transaction
		await db.$transaction([
			db.proposalSlot.update({
				where: { id: slotId },
				data: { isSelected: true }
			}),
			db.proposalGroup.update({
				where: { id: proposal.id },
				data: {
					status: 'confirmed',
					guestName: guestName,
					guestEmail: guestEmail
				}
			}),
			db.appointment.create({
				data: {
					type: 'proposal',
					proposalGroupId: proposal.id,
					hostUserId: proposal.hostUserId,
					guestName,
					guestEmail,
					guestCompany,
					startTime: selectedSlot.startTime,
					endTime: selectedSlot.endTime,
					status: 'confirmed',
					location: proposal.location
				}
			})
		]);

		redirect(302, `/p/${params.slug}/complete`);
	}
};
