import { Hono } from 'hono';
import { sentry } from '@hono/sentry';
import { InferModel } from 'drizzle-orm';

import authRoutes from './routes/authRoutes';
import tweetRoutes from './routes/tweetRoutes';
import userRoutes from './routes/userRoutes';
import { users } from './db/schema';
import { authenticateToken } from './middlewares/authMiddleware';

export type Env = {
	SENTRY_DSN: string;
	DATABASE_URL: string;
	JWT_SECRET: string;
	AWS_ACCESS_KEY_ID: string;
	AWS_SECRET_ACCESS_KEY: string;
	AWS_REGION: string;
};

export type Variables = {
	user: InferModel<typeof users, 'select'>;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', async (c, next) => {
	const logging = sentry({ dsn: c.env.SENTRY_DSN });
	await logging(c, next);
});

app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

app.use('/user/*', authenticateToken);
app.use('/tweet/*', authenticateToken);

app.route('/auth/', authRoutes);
app.route('/tweet/', tweetRoutes);
app.route('/user/', userRoutes);

app.get('/', (c) => {
	return c.json({ message: 'Hello World!' });
});

export default app;
