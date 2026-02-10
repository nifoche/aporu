import type { User } from '$lib/server/db/schema';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			sessionId: string | null;
		}

		interface Platform {
			env: {
				DB: D1Database;
				SESSION_SECRET: string;
				GOOGLE_CLIENT_ID: string;
				GOOGLE_CLIENT_SECRET: string;
				MICROSOFT_CLIENT_ID?: string;
				MICROSOFT_CLIENT_SECRET?: string;
			};
		}
	}
}

export {};
