import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { Env, Variables } from '../app';
import { users } from '../db/schema';

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

router.post('/', async (c) => {
	const { email, username, name } = await c.req.json();

	try {
		const insertedUser = await c
			.get('db')
			.insert(users)
			.values({ email, username, name })
			.returning({ id: users.id });
		return c.json({ message: insertedUser });
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot create user' });
	}

	//throw new HTTPException(401);
});

export default router;
