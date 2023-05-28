import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

import * as schema from '../db/schema';

dotenv.config();
const { DATABASE_URL } = process.env;
const queryClient = postgres(DATABASE_URL || '', { ssl: 'require' });
export const db = drizzle(queryClient, { schema });
