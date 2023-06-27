import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

import { connectToDatabase } from '../services/databaseService';
import { tokens } from '../db/schema';

export async function authenticateToken(c: Context, next: () => Promise<void>) {
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
}
