import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from '../../src/db/schema';

export function connectToDatabase(databaseUrl: string) {
	const queryClient = new Pool({ connectionString: databaseUrl });
	return drizzle(queryClient, { schema });
}
