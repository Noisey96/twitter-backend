import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users, tokens, tweets } from '../db/schema';
import { db } from '../services/databaseService';

const router = Router();

//const userInsertSchema = createInsertSchema(users);
const userSelectSchema = z.string().uuid();

// creates a new user
router.post('/', async (req, res) => {
	res.sendStatus(401);
});

// lists all users
router.get('/', async (req, res) => {
	const allUsers = await db.query.users.findMany();

	res.json(allUsers);
});

// gets current user
router.get('/myself', async (req, res) => {
	// @ts-ignore
	const user = req.user;
	res.json(user);
});

// gets one user
router.get('/:id', async (req, res) => {
	const { id } = req.params;

	// validate user id
	try {
		userSelectSchema.parse(id);
	} catch (_) {
		return res.status(400).json({ error: 'Cannot get user' });
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, id),
		with: { tweets: true },
	});

	if (!user) return res.status(404).json({ error: 'Cannot get user' });
	res.json(user);
});

// updates one user
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { name, image, bio } = req.body;
	// @ts-ignore
	const user = req.user;

	// validate user id and user
	try {
		userSelectSchema.parse(id);
		//userInsertSchema.parse({ email: user.email, name, image, bio });
	} catch (_) {
		return res.status(400).json({ error: 'Cannot delete user' });
	}

	// determine whether the logged in user is being updated
	if (user.id !== id) return res.status(401).json({ message: 'Cannot update user' });

	try {
		const updatedUsers = await db.update(users).set({ bio, name, image }).where(eq(users.id, id)).returning();
		const updatedUser = updatedUsers[0];

		res.json(updatedUser);
	} catch (err) {
		res.status(400).json({ error: 'Cannot update user' });
	}
});

// deletes one user along with their tokens and tweets
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	// @ts-ignore
	const user = req.user;

	// validate user id
	try {
		userSelectSchema.parse(id);
	} catch (_) {
		return res.status(400).json({ error: 'Cannot delete user' });
	}

	// determine whether the logged in user is being deleted
	if (user.id !== id) return res.status(401).json({ message: 'Cannot delete user' });

	try {
		await db.delete(tokens).where(eq(tokens.userId, id));
		await db.delete(tweets).where(eq(tweets.userId, id));
		await db.delete(users).where(eq(users.id, id));

		res.sendStatus(200);
	} catch (err) {
		res.status(400).json({ error: 'Cannot delete user' });
	}
});

export default router;
