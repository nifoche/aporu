import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getDB } from '$lib/server/db';
import { proposalGroups, proposalSlots } from '$lib/server/db/schema';

function generateSlug(): string {
	return Math.random().toString(36).substring(2, 10);
}

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		const db = getDB(platform);
		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim();
		const guestName = formData.get('guestName')?.toString().trim() || null;
		const guestEmail = formData.get('guestEmail')?.toString().trim() || null;
		const duration = parseInt(formData.get('duration')?.toString() || '60');
		const location = formData.get('location')?.toString().trim() || null;
		const notes = formData.get('notes')?.toString().trim() || null;

		// Parse slot data from form
		const slotsJson = formData.get('slots')?.toString();

		if (!title) {
			return fail(400, { error: 'タイトルを入力してください' });
		}

		let slots: Array<{ date: string; start: string; end: string }> = [];
		if (slotsJson) {
			try {
				slots = JSON.parse(slotsJson);
			} catch {
				return fail(400, { error: '日程候補のデータが不正です' });
			}
		}

		if (slots.length === 0) {
			return fail(400, { error: '少なくとも1つの日程候補を選択してください' });
		}

		const slug = generateSlug();
		const now = new Date().toISOString();

		// Create proposal group
		const proposalGroupId = crypto.randomUUID();
		await db.insert(proposalGroups).values({
			id: proposalGroupId,
			title,
			slug,
			hostUserId: locals.user!.id,
			guestName,
			guestEmail,
			duration,
			location,
			notes,
			createdAt: now,
			updatedAt: now
		});

		// Create proposal slots
		for (const slot of slots) {
			const [startH, startM] = slot.start.split(':').map(Number);
			const startTime = new Date(slot.date);
			startTime.setHours(startH, startM, 0, 0);
			const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

			await db.insert(proposalSlots).values({
				id: crypto.randomUUID(),
				proposalGroupId,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString(),
				createdAt: now
			});
		}

		redirect(302, '/proposals');
	}
};
