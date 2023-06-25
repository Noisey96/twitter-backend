import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { eq } from 'drizzle-orm';

import { Env, Variables } from '../app';
import { connectToDatabase } from '../services/databaseService';
import { tweets } from '../../src/db/schema';

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

// creates a new tweet
router.post('/', async (c) => {
	const { user, content, image } = await c.req.json();
	// TODO - add user via auth

	try {
		const db = connectToDatabase(c.env.DATABASE_URL);
		const insertedTweets = await db
			.insert(tweets)
			.values({ content, image, userId: user.id })
			.returning({ id: tweets.id });
		const tweetId = insertedTweets[0].id;
		const result = await db.query.tweets.findFirst({
			where: eq(tweets.id, tweetId),
			with: { user: true },
		});
		return c.json(result);
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot create tweet' });
	}
});

// lists all tweets
router.get('/', async (c) => {
	const db = connectToDatabase(c.env.DATABASE_URL);
	const allTweets = await db.query.tweets.findMany({
		with: {
			user: { columns: { id: true, username: true, name: true, image: true } },
		},
	});

	return c.json(allTweets);
});

// gets one tweet
router.get('/:id', async (c) => {
	const { id } = c.req.param();

	const db = connectToDatabase(c.env.DATABASE_URL);
	const tweet = await db.query.tweets.findFirst({
		where: eq(tweets.id, id),
		with: { user: true },
	});

	if (!tweet) throw new HTTPException(404, { message: 'Cannot get tweet' });
	return c.json(tweet);
});

// updates one tweet
router.put('/:id', async (c) => {
	const { id } = c.req.param();
	const { content, image } = await c.req.json();

	// TODO - validate updated tweet belongs to logged in user

	try {
		const db = connectToDatabase(c.env.DATABASE_URL);
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

	// TODO - validate deleted tweet belongs to logged in user

	try {
		const db = connectToDatabase(c.env.DATABASE_URL);
		await db.delete(tweets).where(eq(tweets.id, id)).returning();

		c.status(200);
		return c.text('Ok');
	} catch (err) {
		throw new HTTPException(400, { message: 'Cannot delete tweet' });
	}
});

export default router;
