import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { eq } from 'drizzle-orm';

import { Env, Variables } from '../app';
import { connectToDatabaseViaHTTP, connectToDatabaseViaWebSockets } from '../services/databaseService';
import { tweets } from '../../src/db/schema';

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

// creates a new tweet
router.post('/', async (c) => {
	const { content, image } = await c.req.json();
	const user = c.get('user');

	try {
		const db = connectToDatabaseViaWebSockets(c.env.DATABASE_URL);
		const insertedTweets = await db
			.insert(tweets)
			.values({ content, image, userId: user.id })
			.returning({ id: tweets.id });
		const tweetId = insertedTweets[0].id;
		const result = await db.query.tweets.findFirst({
			where: eq(tweets.id, tweetId),
			with: { user: { columns: { id: true, username: true, image: true } } },
		});
		return c.json(result);
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot create tweet' });
	}
});

// lists all tweets
router.get('/', async (c) => {
	const db = connectToDatabaseViaHTTP(c.env.DATABASE_URL);
	const allTweets = await db.query.tweets.findMany({
		with: {
			user: { columns: { id: true, username: true, image: true } },
		},
	});

	return c.json(allTweets);
});

// gets one tweet
router.get('/:id', async (c) => {
	const { id } = c.req.param();

	const db = connectToDatabaseViaHTTP(c.env.DATABASE_URL);
	const tweet = await db.query.tweets.findFirst({
		where: eq(tweets.id, id),
		with: { user: { columns: { id: true, username: true, image: true } } },
	});

	if (!tweet) throw new HTTPException(404, { message: 'Cannot get tweet' });
	return c.json(tweet);
});

// updates one tweet
router.put('/:id', async (c) => {
	const { id } = c.req.param();
	const { content, image } = await c.req.json();
	const user = c.get('user');

	try {
		// validate updated tweet belongs to logged in user
		const db = connectToDatabaseViaWebSockets(c.env.DATABASE_URL);
		const tweet = await db.query.tweets.findFirst({
			where: eq(tweets.id, id),
			with: { user: { columns: { id: true } } },
		});
		if (user.id !== tweet?.user.id) throw new HTTPException(401, { message: 'Unauthorized' });

		// updates tweet
		const updatedTweets = await db.update(tweets).set({ content, image }).where(eq(tweets.id, id)).returning();
		const updatedTweet = updatedTweets[0];

		return c.json(updatedTweet);
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot update tweet' });
	}
});

// deletes one tweet
router.delete('/:id', async (c) => {
	const { id } = c.req.param();
	const user = c.get('user');

	try {
		// validate deleted tweet belongs to logged in user
		const db = connectToDatabaseViaWebSockets(c.env.DATABASE_URL);
		const tweet = await db.query.tweets.findFirst({
			where: eq(tweets.id, id),
			with: { user: { columns: { id: true } } },
		});
		if (user.id !== tweet?.user.id) throw new HTTPException(401, { message: 'Unauthorized' });

		// deletes tweet
		await db.delete(tweets).where(eq(tweets.id, id)).returning();

		c.status(200);
		return c.text('OK');
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot delete tweet' });
	}
});

export default router;
