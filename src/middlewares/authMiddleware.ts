import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { InferModel, eq } from 'drizzle-orm';

import { tokens, users } from '../db/schema';
import { db } from '../services/databaseService';

const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT SECRET';

type User = InferModel<typeof users, 'select'>;
type AuthRequest = Request & { user?: User };

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
	// ensure caller has a JWT token
	const authHeader = req.headers['authorization'];
	const jwtToken = authHeader?.split(' ')[1];
	if (!jwtToken) return res.sendStatus(401);

	try {
		// decode the JWT token
		const payload = jwt.verify(jwtToken, JWT_SECRET) as { tokenId: string };

		// find the equivalent DB token
		const dbToken = await db.query.tokens.findFirst({
			where: eq(tokens.id, payload.tokenId),
			with: { user: true },
		});

		// handle when DB token is invalid
		if (!dbToken || dbToken.type !== 'API' || !dbToken.valid || dbToken.expiration < new Date())
			return res.sendStatus(401);

		// handle when DB token is valid
		req.user = dbToken.user;
	} catch (e) {
		return res.sendStatus(401);
	}

	next();
}
