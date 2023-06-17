import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { users, tokens } from '../db/schema';
import { sendEmailToken } from '../services/emailService';
import { db } from '../services/databaseService';

const router = Router();

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT SECRET';

// Gnerates a random 6 digit number as the email token
function generateEmailToken() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generates JWT token
function generateAuthToken(tokenId: string) {
	const jwtPayload = { tokenId };

	return jwt.sign(jwtPayload, JWT_SECRET, {
		algorithm: 'HS256',
		noTimestamp: true,
	});
}

const loginSchema = z.string().email();

// Creates a new user or initiate login process for existing users
router.post('/login', async (req, res) => {
	// validates provided email
	const { email } = req.body;
	try {
		loginSchema.parse(email);
	} catch (_) {
		return res.status(400).json({ error: 'Cannot login' });
	}

	// generates email token
	const emailToken = generateEmailToken();
	const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
	try {
		// generates user if email is new and generates email token
		let intendedUsers = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
		if (!intendedUsers.length) intendedUsers = await db.insert(users).values({ email }).returning({ id: users.id });
		const userId = intendedUsers[0].id;
		await db.insert(tokens).values({ tokenType: 'EMAIL', emailToken, expiration, userId });

		// sends email token to the email
		await sendEmailToken(email, emailToken);
		res.sendStatus(200);
	} catch (_) {
		res.status(400).json({ error: 'Cannot login' });
	}
});

const authenticateSchema = z.object({
	email: z.string().email(),
	emailToken: z.string().length(6),
});

// Validates the login process
router.post('/authenticate', async (req, res) => {
	// validates provided email and email token
	const { email, emailToken } = req.body;
	try {
		authenticateSchema.parse({ email, emailToken });
	} catch (_) {
		return res.sendStatus(401);
	}

	// finds email token on database
	const dbEmailToken = await db.query.tokens.findFirst({
		where: eq(tokens.emailToken, emailToken),
		columns: { id: true, valid: true, expiration: true },
		with: { user: { columns: { id: true, email: true } } },
	});

	// validates given email and email token
	if (!dbEmailToken?.valid) return res.sendStatus(401);
	if (dbEmailToken.expiration < new Date()) return res.sendStatus(401);
	if (dbEmailToken.user.email !== email) return res.sendStatus(401);

	// if valid, generates a API token
	const expiration = new Date(new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000);
	const apiTokens = await db
		.insert(tokens)
		.values({ tokenType: 'API', expiration, userId: dbEmailToken.user.id })
		.returning({ id: tokens.id });
	const apiToken = apiTokens[0];

	// invalidates the email token
	await db.update(tokens).set({ valid: false }).where(eq(tokens.id, dbEmailToken.id));

	// generates the JWT token
	const authToken = generateAuthToken(apiToken.id);
	res.json({ authToken });
});

export default router;
