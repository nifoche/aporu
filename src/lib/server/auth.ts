import { eq, and, gt } from 'drizzle-orm';
import { getDB } from './db';
import { sessions, users } from './db/schema';
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

export async function createSession(userId: string, platform: Readonly<App.Platform> | undefined) {
	const db = getDB(platform);
	const sessionId = generateSessionId();
	const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		expiresAt: expiresAt.toISOString()
	});

	return { sessionId, expiresAt };
}

export async function validateSession(sessionId: string, platform: Readonly<App.Platform> | undefined) {
	const db = getDB(platform);

	const result = await db
		.select({
			session: sessions,
			user: users
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId))
		.get();

	if (!result) return null;

	const { session, user } = result;

	// Check expiry
	const expiresAt = new Date(session.expiresAt);
	if (expiresAt < new Date()) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		return null;
	}

	// Extend session if it's past half its lifetime
	const halfLife = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000 / 2;
	if (expiresAt.getTime() - Date.now() < halfLife) {
		const newExpiry = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
		await db
			.update(sessions)
			.set({ expiresAt: newExpiry.toISOString() })
			.where(eq(sessions.id, sessionId));
		session.expiresAt = newExpiry.toISOString();
	}

	return { ...session, user };
}

export async function invalidateSession(sessionId: string, platform: Readonly<App.Platform> | undefined) {
	const db = getDB(platform);
	await db.delete(sessions).where(eq(sessions.id, sessionId)).catch(() => {});
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
