import { Router } from 'express';
import { eq } from 'drizzle-orm';

import { users } from '../db/schema';
import { db } from '../services/databaseService';

const router = Router();

// create a new user
router.post('/', async (req, res) => {
	res.sendStatus(401);
});

// list all users
router.get('/', async (req, res) => {
	const allUsers = await db.query.users.findMany();

	res.json(allUsers);
});

// get one user
router.get('/:id', async (req, res) => {
	const { id } = req.params;

	const user = await db.query.users.findFirst({
		where: eq(users.id, id),
		with: { tweets: true },
	});

	if (!user) return res.status(404).json({ error: `User ${id} not found` });
	res.json(user);
});

// update one user
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { name, image, bio } = req.body;
	// @ts-ignore
	const user = req.user;

	// determine whether the logged in user is being updated
	if (user.id !== id) return res.status(401).json({ message: 'You are not allowed to update this user' });

	try {
		const result = await db.update(users).set({ bio, name, image }).where(eq(users.id, id)).returning()[0];

		res.json(result);
	} catch (err) {
		res.status(400).json({ error: `Failed to update user ${id}` });
	}
});

// delete one user
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	// @ts-ignore
	const user = req.user;

	// determine whether the logged in user is being deleted
	if (user.id !== id) return res.status(401).json({ message: 'You are not allowed to delete this user' });

	try {
		await db.delete(users).where(eq(users.id, id));

		res.sendStatus(200);
	} catch (err) {
		res.status(400).json({ error: `Failed to delete user ${id}, because user has active tweets.` });
	}
});

export default router;
