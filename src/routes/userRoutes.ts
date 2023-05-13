import { Router } from 'express';

const router = Router();

// create a new user
router.post('/', (req, res) => {
	res.status(501).json({ error: 'Not Implemented' });
});

// list all users
router.get('/', (req, res) => {
	res.status(501).json({ error: 'Not Implemented' });
});

// get one user
router.get('/:id', (req, res) => {
	const { id } = req.params;
	res.status(501).json({ error: `Not Implemented for User ${id}` });
});

// update one user
router.put('/:id', (req, res) => {
	const { id } = req.params;
	res.status(501).json({ error: `Not Implemented for User ${id}` });
});

// delete one user
router.delete('/:id', (req, res) => {
	const { id } = req.params;
	res.status(501).json({ error: `Not Implemented for User ${id}` });
});

export default router;
