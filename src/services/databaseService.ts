import { drizzle } from 'drizzle-orm/postgres-js';
import { DefaultLogger, LogWriter } from 'drizzle-orm';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import * as schema from '../db/schema';

dotenv.config();
const { DATABASE_URL } = process.env;

class ConsoleLogWriter implements LogWriter {
	write(message: string): void {
		console.log(message);
	}
}

class ToFileLogWriter implements LogWriter {
	write(message: string): void {
		try {
			const filePath = path.resolve(__dirname, '../../logs/db.txt');
			const newMessage = message + '\r\n';
			fs.writeFileSync(filePath, newMessage, { flag: 'a' });
		} catch (err) {
			console.error(err);
		}
	}
}

const queryClient = postgres(DATABASE_URL || '', { ssl: 'require' });
const logger = new DefaultLogger({ writer: new ToFileLogWriter() });
export const db = drizzle(queryClient, { schema, logger });
