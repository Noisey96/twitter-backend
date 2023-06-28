import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as jose from 'jose';
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
		const jwtSecret = new TextEncoder().encode(c.env.JWT_SECRET);
		const { payload } = await jose.jwtVerify(jwtToken, jwtSecret);
		const tokenId = payload.tokenId as string;
		if (!tokenId) throw new HTTPException(401, { message: 'Unauthorized' });

		// finds equivalent DB token
		const db = connectToDatabase(c.env.DATABASE_URL);
		const dbToken = await db.query.tokens.findFirst({
			where: eq(tokens.id, tokenId),
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
