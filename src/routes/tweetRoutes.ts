import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// create a new tweet
router.post('/', async (req, res) => {
	const { content, image } = req.body;
	// @ts-ignore
	const user = req.user;

	try {
		const result = await prisma.tweet.create({
			data: {
				content,
				image,
				userId: user.id,
			},
		});

		res.json(result);
	} catch (err) {
		res.status(400).json({ error: 'User needs to exist.' });
	}
});

// list all tweets
router.get('/', async (req, res) => {
	const allTweets = await prisma.tweet.findMany({
		include: {
			user: {
				select: {
					id: true,
					username: true,
					name: true,
					image: true,
				},
			},
		},
	});

	res.json(allTweets);
});

// get one tweet
router.get('/:id', async (req, res) => {
	const { id } = req.params;

	const tweet = await prisma.tweet.findUnique({
		where: { id: id },
		include: {
			user: true,
		},
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
	const tweet = await prisma.tweet.findUnique({
		where: { id: id },
		include: {
			user: {
				select: {
					id: true,
				},
			},
		},
	});
	if (user.id !== tweet?.user.id) return res.status(404).json({ error: 'You are not allowed to update this tweet' });

	try {
		const result = await prisma.tweet.update({
			where: { id: id },
			data: { content, image },
		});

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
	const tweet = await prisma.tweet.findUnique({
		where: { id: id },
		include: {
			user: {
				select: {
					id: true,
				},
			},
		},
	});
	if (user.id !== tweet?.user.id) return res.status(404).json({ error: 'You are not allowed to delete this tweet' });

	await prisma.tweet.delete({ where: { id: id } });

	res.sendStatus(200);
});

export default router;
