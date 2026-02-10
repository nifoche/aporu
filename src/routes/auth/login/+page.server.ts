import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { getDB } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { createSession, setSessionCookie } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	default: async (event) => {
		const db = getDB(event.platform);
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim();
		const name = formData.get('name')?.toString().trim();

		if (!email || !name) {
			return fail(400, { error: 'メールアドレスと名前を入力してください' });
		}

		// Find or create user (dev login)
		let user = await db.select().from(users).where(eq(users.email, email)).get();

		if (!user) {
			const userId = crypto.randomUUID();
			const now = new Date().toISOString();
			const inserted = await db.insert(users).values({
				id: userId,
				email,
				name,
				createdAt: now,
				updatedAt: now
			}).returning().get();
			user = inserted;
		}

		const { sessionId, expiresAt } = await createSession(user.id, event.platform);
		setSessionCookie(event, sessionId, expiresAt);

		redirect(302, '/dashboard');
	}
};
