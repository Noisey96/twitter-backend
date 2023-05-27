import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();
const { DATABASE_URL } = process.env;

const migrationClient = postgres(DATABASE_URL || '', { max: 1, ssl: 'require' });
migrate(drizzle(migrationClient), { migrationsFolder: 'migrations' });

const queryClient = postgres(DATABASE_URL || '', { ssl: 'require' });
const db: PostgresJsDatabase = drizzle(queryClient);
//await db.select().from()
