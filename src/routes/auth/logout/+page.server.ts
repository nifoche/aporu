import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { invalidateSession, deleteSessionCookie } from '$lib/server/auth';

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.sessionId) {
			await invalidateSession(event.locals.sessionId);
		}
		deleteSessionCookie(event);
		redirect(302, '/auth/login');
	}
};
