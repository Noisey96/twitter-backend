import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = 'SUPER_SECRET';

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
		const dbToken = await prisma.token.findUnique({
			where: { id: payload.tokenId },
			include: { user: true },
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
