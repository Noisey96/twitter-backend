import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { DefaultLogger, LogWriter } from 'drizzle-orm';

import * as schema from '../../src/db/schema';

class ConsoleLogWriter implements LogWriter {
	write(message: string): void {
		console.log(message);
	}
}

export function connectToDatabase(databaseUrl: string) {
	const queryClient = new Pool({ connectionString: databaseUrl });
	const logger = new DefaultLogger({ writer: new ConsoleLogWriter() });
	return drizzle(queryClient, { schema, logger });
}
