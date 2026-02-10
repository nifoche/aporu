import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';

function generateSlug(title: string): string {
	const base = title
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
	const suffix = Math.random().toString(36).substring(2, 8);
	return base ? `${base}-${suffix}` : suffix;
}

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || null;
		const duration = parseInt(formData.get('duration')?.toString() || '30');
		const bufferBefore = parseInt(formData.get('bufferBefore')?.toString() || '0');
		const bufferAfter = parseInt(formData.get('bufferAfter')?.toString() || '0');
		const minNotice = parseInt(formData.get('minNotice')?.toString() || '60');
		const maxDaysAhead = parseInt(formData.get('maxDaysAhead')?.toString() || '30');

		if (!title) {
			return fail(400, { error: 'タイトルを入力してください' });
		}

		// Build available hours from form
		const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
		const availableHours: Record<string, Array<{ start: string; end: string }>> = {};

		for (const day of days) {
			const enabled = formData.get(`day_${day}`) === 'on';
			if (enabled) {
				const start = formData.get(`start_${day}`)?.toString() || '09:00';
				const end = formData.get(`end_${day}`)?.toString() || '17:00';
				availableHours[day] = [{ start, end }];
			}
		}

		const slug = generateSlug(title);

		const bookingPage = await db.bookingPage.create({
			data: {
				title,
				slug,
				description,
				userId: locals.user!.id,
				duration,
				bufferBefore,
				bufferAfter,
				minNotice,
				maxDaysAhead,
				availableHours: JSON.stringify(availableHours)
			}
		});

		redirect(302, '/booking-pages');
	}
};
