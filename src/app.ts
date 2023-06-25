import { Hono } from 'hono';
import authRoutes from './routes/authRoutes';
import tweetRoutes from './routes/tweetRoutes';
import userRoutes from './routes/userRoutes';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { DefaultLogger, LogWriter } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';

import * as schema from './db/schema';

class ConsoleLogWriter implements LogWriter {
	write(message: string): void {
		console.log(message);
	}
}

export type Env = {
	DATABASE_URL: string;
	JWT_SECRET: string;
	AWS_ACCESS_KEY_ID: string;
	AWS_SECRET_ACCESS_KEY: string;
	AWS_REGION: string;
};

export type Variables = {
	db: ReturnType<typeof drizzle>;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

app.use('*', async (c, next) => {
	const queryClient = new Pool({ connectionString: c.env.DATABASE_URL });
	const logger = new DefaultLogger({ writer: new ConsoleLogWriter() });
	const db = drizzle(queryClient, { schema, logger });
	c.set('db', db);
	await next();
});

app.route('/auth', authRoutes);
app.route('/tweet', tweetRoutes);
app.route('/user', userRoutes);

app.get('/', (c) => {
	return c.json({ message: 'Hello World!' });
});

export default app;
