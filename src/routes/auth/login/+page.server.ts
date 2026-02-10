import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { createSession, setSessionCookie } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim();
		const name = formData.get('name')?.toString().trim();

		if (!email || !name) {
			return fail(400, { error: 'メールアドレスと名前を入力してください' });
		}

		// Find or create user (dev login)
		let user = await db.user.findUnique({ where: { email } });

		if (!user) {
			user = await db.user.create({
				data: { email, name }
			});
		}

		const { sessionId, expiresAt } = await createSession(user.id);
		setSessionCookie(event, sessionId, expiresAt);

		redirect(302, '/dashboard');
	}
};
