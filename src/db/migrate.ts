import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();
const { DATABASE_URL } = process.env;

const doMigration = async () => {
	try {
		const migrationClient = postgres(DATABASE_URL || '', { max: 1, ssl: 'require' });
		await migrate(drizzle(migrationClient), { migrationsFolder: './migrations' });
		console.log('Migration completed!');
		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(0);
	}
};

doMigration();
