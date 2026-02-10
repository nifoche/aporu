import type { Handle } from '@sveltejs/kit';
import { getSessionIdFromCookie, validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = getSessionIdFromCookie(event);

	if (sessionId) {
		const session = await validateSession(sessionId);
		if (session) {
			event.locals.user = session.user;
			event.locals.sessionId = sessionId;
		} else {
			event.locals.user = null;
			event.locals.sessionId = null;
		}
	} else {
		event.locals.user = null;
		event.locals.sessionId = null;
	}

	return resolve(event);
};
