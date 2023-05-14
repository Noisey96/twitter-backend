import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// create a new user
router.post('/', async (req, res) => {
	const { email, name, username } = req.body;

	try {
		const result = await prisma.user.create({
			data: {
				email,
				name,
				username,
				bio: "Hello, I'm new on Twitter",
			},
		});

		res.json(result);
	} catch (err) {
		res.status(400).json({ error: 'Username and email should be unique.' });
	}
});

// list all users
router.get('/', async (req, res) => {
	const allUsers = await prisma.user.findMany();

	res.json(allUsers);
});

// get one user
router.get('/:id', async (req, res) => {
	const { id } = req.params;

	const user = await prisma.user.findUnique({
		where: { id: id },
		include: { tweets: true },
	});

	if (!user) return res.status(404).json({ error: `Tweet ${id} not found` });
	res.json(user);
});

// update one user
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { name, image, bio } = req.body;

	try {
		const result = await prisma.user.update({
			where: { id: id },
			data: { bio, name, image },
		});

		res.json(result);
	} catch (err) {
		res.status(400).json({ error: `Failed to update user ${id}` });
	}
});

// delete one user
router.delete('/:id', async (req, res) => {
	const { id } = req.params;

	try {
		await prisma.user.delete({ where: { id: id } });
		res.sendStatus(200);
	} catch (err) {
		res.status(400).json({ error: `Failed to delete user ${id}, because user has active tweets.` });
	}
});

export default router;
