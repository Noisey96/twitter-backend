import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { tweets } from '../db/schema';
import { db } from '../services/databaseService';

const router = Router();

//const tweetInsertSchema = createInsertSchema(tweets, { userId: z.string().uuid() });
const tweetSelectSchema = z.string().uuid();

// creates a new tweet
router.post('/', async (req, res) => {
	const { content, image } = req.body;
	// @ts-ignore
	const user = req.user;

	// validate tweet
	try {
		//tweetInsertSchema.parse({ content, image, userId: user.id });
	} catch (_) {
		return res.status(400).json({ error: 'Cannot create tweet' });
	}

	try {
		const insertedTweets = await db
			.insert(tweets)
			.values({ content, image, userId: user.id })
			.returning({ id: tweets.id });
		const tweetId = insertedTweets[0].id;
		const result = await db.query.tweets.findFirst({
			where: eq(tweets.id, tweetId),
			with: { user: true },
		});
		res.json(result);
	} catch (err) {
		res.status(400).json({ error: 'Cannot create tweet' });
	}
});

// lists all tweets
router.get('/', async (req, res) => {
	const allTweets = await db.query.tweets.findMany({
		with: {
			user: { columns: { id: true, username: true, name: true, image: true } },
		},
	});

	res.json(allTweets);
});

// gets one tweet
router.get('/:id', async (req, res) => {
	const { id } = req.params;

	// validate tweet id
	try {
		tweetSelectSchema.parse(id);
	} catch (_) {
		return res.status(400).json({ error: 'Cannot get tweet' });
	}

	const tweet = await db.query.tweets.findFirst({
		where: eq(tweets.id, id),
		with: { user: true },
	});

	if (!tweet) return res.status(404).json({ error: 'Cannot get tweet' });
	res.json(tweet);
});

// updates one tweet
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { content, image } = req.body;
	// @ts-ignore
	const user = req.user;

	// validate tweet id and tweet
	try {
		tweetSelectSchema.parse(id);
		//tweetInsertSchema.parse({ content, image, userId: user.id });
	} catch (_) {
		return res.status(400).json({ error: 'Cannot update tweet' });
	}

	// determines whether the logged in user is updating one of their tweets
	const tweet = await db.query.tweets.findFirst({
		where: eq(tweets.id, id),
		with: { user: { columns: { id: true } } },
	});
	if (user.id !== tweet?.user.id) return res.status(404).json({ error: 'Cannot update tweet' });

	try {
		const updatedTweets = await db.update(tweets).set({ content, image }).where(eq(tweets.id, id)).returning();
		const updatedTweet = updatedTweets[0];

		res.json(updatedTweet);
	} catch (err) {
		res.status(400).json({ error: 'Cannot update tweet' });
	}
});

// deletes one tweet
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	// @ts-ignore
	const user = req.user;

	// validate tweet id
	try {
		tweetSelectSchema.parse(id);
	} catch (_) {
		return res.status(400).json({ error: 'Cannot delete tweet' });
	}

	// determines whether the logged in user is deleting one of their tweets
	const tweet = await db.query.tweets.findFirst({
		where: eq(tweets.id, id),
		with: { user: { columns: { id: true } } },
	});
	if (user.id !== tweet?.user.id) return res.status(404).json({ error: 'Cannot delete tweet' });

	await db.delete(tweets).where(eq(tweets.id, id));

	res.sendStatus(200);
});

export default router;
