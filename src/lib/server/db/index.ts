import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type DB = ReturnType<typeof drizzle<typeof schema>>;

/**
 * D1データベースからDrizzleクライアントを作成
 */
export function createDB(d1: D1Database): DB {
	return drizzle(d1, { schema });
}

/**
 * SvelteKitのプラットフォームイベントからDBを取得
 */
export function getDB(platform: Readonly<App.Platform> | undefined): DB {
	if (!platform?.env?.DB) {
		throw new Error('DB binding not found');
	}
	return createDB(platform.env.DB);
}
