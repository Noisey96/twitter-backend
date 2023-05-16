import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { sendEmailToken } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT SECRET';

// Gnerate a random 6 digit number as the email token
function generateEmailToken(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate JWT token
function generateAuthToken(tokenId: string): string {
	const jwtPayload = { tokenId };

	return jwt.sign(jwtPayload, JWT_SECRET, {
		algorithm: 'HS256',
		noTimestamp: true,
	});
}

// Create a new user or initiate login process for existing users
router.post('/login', async (req, res) => {
	const { email } = req.body;

	// generate email token
	const emailToken = generateEmailToken();
	const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
	try {
		await prisma.token.create({
			data: {
				type: 'EMAIL',
				emailToken,
				expiration,
				user: {
					connectOrCreate: {
						where: { email },
						create: { email },
					},
				},
			},
		});

		// send email token to the email
		await sendEmailToken(email, emailToken);
		res.sendStatus(200);
	} catch (err) {
		res.status(400).json({ error: 'Generated email token is not unique.' });
	}
});

// Validate the login process
router.post('/authenticate', async (req, res) => {
	const { email, emailToken } = req.body;

	// find email token on database
	const dbEmailToken = await prisma.token.findUnique({
		where: { emailToken },
		include: { user: true },
	});

	// validate given email and email token
	if (!dbEmailToken || !dbEmailToken.valid) return res.sendStatus(401);
	if (dbEmailToken.expiration < new Date()) return res.status(401).json({ error: 'Token expired!' });
	if (dbEmailToken.user.email !== email) return res.sendStatus(401);

	// if valid, generate a API token
	const expiration = new Date(new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000);
	const apiToken = await prisma.token.create({
		data: {
			type: 'API',
			expiration,
			user: {
				connect: {
					email,
				},
			},
		},
	});

	// invalidate the email token
	await prisma.token.update({
		where: { id: dbEmailToken.id },
		data: { valid: false },
	});

	// generate the JWT token
	const authToken = generateAuthToken(apiToken.id);
	res.json(authToken);
});

export default router;
