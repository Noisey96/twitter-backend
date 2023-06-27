import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { InferModel, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/authRoutes';
import tweetRoutes from './routes/tweetRoutes';
import userRoutes from './routes/userRoutes';
import { connectToDatabase } from './services/databaseService';
import { tokens, users } from './db/schema';

export type Env = {
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

app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

app.use('/tweet/*', async (c, next) => {
	// ensures caller has a JWT token
	const authHeader = c.req.header('authorization');
	const jwtToken = authHeader?.split(' ')[1];
	if (!jwtToken) throw new HTTPException(401, { message: 'Unauthorized' });

	try {
		// decodes JWT token
		const payload = jwt.verify(jwtToken, c.env.JWT_SECRET) as { tokenId: string };

		// finds equivalent DB token
		const db = connectToDatabase(c.env.DATABASE_URL);
		const dbToken = await db.query.tokens.findFirst({
			where: eq(tokens.id, payload.tokenId),
			with: { user: true },
		});

		// handles when DB token is invalid
		if (!dbToken || dbToken.tokenType !== 'JWT' || !dbToken.valid || dbToken.expiration < new Date()) {
			throw new HTTPException(401, { message: 'Unauthorized' });
		}

		c.set('user', dbToken.user);
	} catch (err) {
		throw new HTTPException(401, { message: 'Unauthorized' });
	}

	await next();
});

app.use('/user/*', async (c, next) => {
	// ensures caller has a JWT token
	const authHeader = c.req.header('authorization');
	const jwtToken = authHeader?.split(' ')[1];
	if (!jwtToken) throw new HTTPException(401, { message: 'Unauthorized' });

	try {
		// decodes JWT token
		const payload = jwt.verify(jwtToken, c.env.JWT_SECRET) as { tokenId: string };

		// finds equivalent DB token
		const db = connectToDatabase(c.env.DATABASE_URL);
		const dbToken = await db.query.tokens.findFirst({
			where: eq(tokens.id, payload.tokenId),
			with: { user: true },
		});

		// handles when DB token is invalid
		if (!dbToken || dbToken.tokenType !== 'JWT' || !dbToken.valid || dbToken.expiration < new Date()) {
			throw new HTTPException(401, { message: 'Unauthorized' });
		}

		c.set('user', dbToken.user);
	} catch (err) {
		throw new HTTPException(401, { message: 'Unauthorized' });
	}

	await next();
});

app.route('/auth/', authRoutes);
app.route('/tweet/', tweetRoutes);
app.route('/user/', userRoutes);

app.get('/', (c) => {
	return c.json({ message: 'Hello World!' });
});

export default app;
