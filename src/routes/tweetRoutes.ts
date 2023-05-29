import { Router } from 'express';
import { eq } from 'drizzle-orm';

import { tweets } from '../db/schema';
import { db } from '../services/databaseService';

const router = Router();

// create a new tweet
router.post('/', async (req, res) => {
	const { content, image } = req.body;
	// @ts-ignore
	const user = req.user;

	try {
		const tweetId = await db
			.insert(tweets)
			.values({ content, image, userId: user.id })
			.returning({ id: tweets.id })[0].id;
		const result = await db.query.tweets.findFirst({
			where: eq(tweets.id, tweetId),
			with: { user: true },
		});
		res.json(result);
	} catch (err) {
		res.status(400).json({ error: 'User needs to exist.' });
	}
});

// list all tweets
router.get('/', async (req, res) => {
	const allTweets = await db.query.tweets.findMany({
		with: { user: { columns: { id: true, username: true, name: true, image: true } } },
	});

	res.json(allTweets);
});

// get one tweet
router.get('/:id', async (req, res) => {
	const { id } = req.params;

	const tweet = await db.query.tweets.findFirst({
		where: eq(tweets.id, id),
		with: { user: true },
	});

	if (!tweet) return res.status(404).json({ error: `Tweet ${id} not found` });
	res.json(tweet);
});

// update one tweet
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { content, image } = req.body;
	// @ts-ignore
	const user = req.user;

	// determine whether the logged in user is updating one of their tweets
	const tweet = await db.query.tweets.findFirst({
		where: eq(tweets.id, id),
		with: { user: { columns: { id: true } } },
	});
	if (user.id !== tweet?.user.id) return res.status(404).json({ error: 'You are not allowed to update this tweet' });

	try {
		const result = await db.update(tweets).set({ content, image }).where(eq(tweets.id, id)).returning()[0];

		res.json(result);
	} catch (err) {
		res.status(400).json({ error: `Failed to update tweet ${id}` });
	}
});

// delete one tweet
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	// @ts-ignore
	const user = req.user;

	// determine whether the logged in user is deleting one of their tweets
	const tweet = await db.query.tweets.findFirst({
		where: eq(tweets.id, id),
		with: { user: { columns: { id: true } } },
	});
	if (user.id !== tweet?.user.id) return res.status(404).json({ error: 'You are not allowed to delete this tweet' });

	await db.delete(tweets).where(eq(tweets.id, id));

	res.sendStatus(200);
});

export default router;
