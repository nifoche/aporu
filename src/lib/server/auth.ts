import { db } from './db';
import type { RequestEvent } from '@sveltejs/kit';

const SESSION_COOKIE_NAME = 'aporu_session';
const SESSION_EXPIRY_DAYS = 30;

function generateSessionId(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export async function createSession(userId: string) {
	const sessionId = generateSessionId();
	const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

	await db.session.create({
		data: {
			id: sessionId,
			userId,
			expiresAt
		}
	});

	return { sessionId, expiresAt };
}

export async function validateSession(sessionId: string) {
	const session = await db.session.findUnique({
		where: { id: sessionId },
		include: { user: true }
	});

	if (!session) return null;

	if (session.expiresAt < new Date()) {
		await db.session.delete({ where: { id: sessionId } });
		return null;
	}

	// Extend session if it's past half its lifetime
	const halfLife = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000 / 2;
	if (session.expiresAt.getTime() - Date.now() < halfLife) {
		const newExpiry = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
		await db.session.update({
			where: { id: sessionId },
			data: { expiresAt: newExpiry }
		});
		session.expiresAt = newExpiry;
	}

	return session;
}

export async function invalidateSession(sessionId: string) {
	await db.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export function setSessionCookie(event: RequestEvent, sessionId: string, expiresAt: Date) {
	event.cookies.set(SESSION_COOKIE_NAME, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false, // Set to true in production with HTTPS
		expires: expiresAt
	});
}

export function deleteSessionCookie(event: RequestEvent) {
	event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export function getSessionIdFromCookie(event: RequestEvent): string | undefined {
	return event.cookies.get(SESSION_COOKIE_NAME);
}
