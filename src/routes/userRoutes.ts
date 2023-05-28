import { Router } from 'express';

const router = Router();

// create a new user
router.post('/', async (req, res) => {
	res.sendStatus(401);
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
	// @ts-ignore
	const user = req.user;

	// determine whether the logged in user is being updated
	if (user.id !== id) return res.status(401).json({ message: 'You are not allowed to update this user' });

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
	// @ts-ignore
	const user = req.user;

	// determine whether the logged in user is being deleted
	if (user.id !== id) return res.status(401).json({ message: 'You are not allowed to delete this user' });

	try {
		await prisma.user.delete({ where: { id: id } });
		res.sendStatus(200);
	} catch (err) {
		res.status(400).json({ error: `Failed to delete user ${id}, because user has active tweets.` });
	}
});

export default router;
