import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as jose from 'jose';
import { eq } from 'drizzle-orm';

import { Env, Variables } from '../app';
import { connectToDatabaseViaWebSockets } from '../services/databaseService';
import { sendEmailToken } from '../services/emailService';
import { users, tokens } from '../../src/db/schema';
import { getErrorMessage } from '../utilities';

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;

// generates a random 6 digit number as the email token
function generateEmailToken() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// generates JWT token
async function generateAuthToken(tokenId: string, secret: string) {
	const jwtPayload = { tokenId };
	const jwtSecret = new TextEncoder().encode(secret);
	return await new jose.SignJWT(jwtPayload).setProtectedHeader({ alg: 'HS256' }).sign(jwtSecret);
}

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

// if the user is found, sends an email token to the user
router.post('/login', async (c) => {
	const { email } = await c.req.json();

	try {
		// finds the user
		const db = connectToDatabaseViaWebSockets(c.env.DATABASE_URL);
		const foundUsers = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
		const found = foundUsers.length > 0;

		// if user is found, creates and sends an email token
		if (found) {
			// generates email token
			const emailToken = generateEmailToken();
			const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
			const userId = foundUsers[0].id;
			await db.insert(tokens).values({ tokenType: 'EMAIL', emailToken, expiration, userId });
			await sendEmailToken(
				email,
				emailToken,
				c.env.AWS_ACCESS_KEY_ID,
				c.env.AWS_SECRET_ACCESS_KEY,
				c.env.AWS_REGION,
			);
		}
		return c.json({ found });
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot login' });
	}
});

// creates a new user
router.post('/register', async (c) => {
	const { email, username } = await c.req.json();

	try {
		// creates a new user
		const db = connectToDatabaseViaWebSockets(c.env.DATABASE_URL);
		const newUsers = await db.insert(users).values({ email, username }).returning({ id: users.id });
		const userId = newUsers[0].id;

		// generates email token
		const emailToken = generateEmailToken();
		const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
		await db.insert(tokens).values({ tokenType: 'EMAIL', emailToken, expiration, userId });
		await sendEmailToken(email, emailToken, c.env.AWS_ACCESS_KEY_ID, c.env.AWS_SECRET_ACCESS_KEY, c.env.AWS_REGION);
		c.status(200);
		return c.text('OK');
	} catch (err) {
		const message = getErrorMessage(err);
		throw new HTTPException(400, { message });
	}
});

// validate the email token and generate JWT token for the user
router.post('/authenticate', async (c) => {
	const { email, emailToken } = await c.req.json();

	// validates email token
	try {
		// on DB, finds email token
		const db = connectToDatabaseViaWebSockets(c.env.DATABASE_URL);
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
		const authToken = await generateAuthToken(apiToken.id, c.env.JWT_SECRET);
		return c.json({ authToken });
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot authenticate' });
	}
});

export default router;
