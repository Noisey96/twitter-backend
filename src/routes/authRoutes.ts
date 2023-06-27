import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

import { Env, Variables } from '../app';
import { connectToDatabase } from '../services/databaseService';
import { sendEmailToken } from '../services/emailService';
import { users, tokens } from '../../src/db/schema';

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;

// generates a random 6 digit number as the email token
function generateEmailToken() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// generates JWT token
function generateAuthToken(tokenId: string, jwtSecret: string) {
	const jwtPayload = { tokenId };

	return jwt.sign(jwtPayload, jwtSecret, {
		algorithm: 'HS256',
		noTimestamp: true,
	});
}

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

// generates and sends email token to the user
router.post('/login', async (c) => {
	// validates provided email
	const { email } = await c.req.json();

	// generates email token
	const emailToken = generateEmailToken();
	const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
	try {
		// on the DB, finds or generates the user and generates email token
		const db = connectToDatabase(c.env.DATABASE_URL);
		let intendedUsers = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
		if (!intendedUsers.length) intendedUsers = await db.insert(users).values({ email }).returning({ id: users.id });
		const userId = intendedUsers[0].id;
		await db.insert(tokens).values({ tokenType: 'EMAIL', emailToken, expiration, userId });

		// sends email token to the email
		await sendEmailToken(email, emailToken);
		c.status(200);
		return c.text('OK');
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot login' });
	}
});

// validate the email token and generate JWT token for the user
router.post('/authenticate', async (c) => {
	const { email, emailToken } = await c.req.json();

	// validates email token
	try {
		// on DB, finds email token
		const db = connectToDatabase(c.env.DATABASE_URL);
		const dbEmailToken = await db.query.tokens.findFirst({
			where: eq(tokens.emailToken, emailToken),
			columns: { id: true, valid: true, expiration: true },
			with: { user: { columns: { id: true, email: true } } },
		});

		// validates given email and email token
		if (!dbEmailToken?.valid) throw new HTTPException(401, { message: 'Unauthorized' });
		if (dbEmailToken.expiration < new Date()) throw new HTTPException(401, { message: 'Unauthorized' });
		if (dbEmailToken.user.email !== email) throw new HTTPException(401, { message: 'Unauthorized' });

		// if valid, generates a API token
		const expiration = new Date(new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000);
		const apiTokens = await db
			.insert(tokens)
			.values({ tokenType: 'JWT', expiration, userId: dbEmailToken.user.id })
			.returning({ id: tokens.id });
		const apiToken = apiTokens[0];

		// invalidates the email token
		await db.update(tokens).set({ valid: false }).where(eq(tokens.id, dbEmailToken.id));

		// generates the JWT token
		const authToken = generateAuthToken(apiToken.id, c.env.JWT_SECRET);
		return c.json({ authToken });
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot authenticate' });
	}
});

export default router;
