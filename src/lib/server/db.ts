import { PrismaClient } from '@prisma/client';
import { building } from '$app/environment';

let _db: PrismaClient;

export function getDb(): PrismaClient {
	if (!_db) {
		_db = new PrismaClient();
	}
	return _db;
}

// Proxy that lazily creates PrismaClient on first access
export const db: PrismaClient = new Proxy({} as PrismaClient, {
	get(_target, prop) {
		if (building) {
			return undefined;
		}
		return (getDb() as Record<string | symbol, unknown>)[prop];
	}
});
