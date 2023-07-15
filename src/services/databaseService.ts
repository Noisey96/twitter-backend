import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle as drizzleHTTP } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWebSockets } from 'drizzle-orm/neon-serverless';

import * as schema from '../../src/db/schema';

export function connectToDatabaseViaHTTP(databaseUrl: string) {
	neonConfig.fetchConnectionCache = true;
	const init = neon(databaseUrl!);
	return drizzleHTTP(init, { schema });
}

export function connectToDatabaseViaWebSockets(databaseUrl: string) {
	neonConfig.fetchConnectionCache = true;
	const queryClient = new Pool({ connectionString: databaseUrl });
	return drizzleWebSockets(queryClient, { schema });
}
