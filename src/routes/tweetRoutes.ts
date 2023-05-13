import { Router } from 'express';

const router = Router();

// create a new tweet
router.post('/', (req, res) => {
	res.status(501).json({ error: 'Not Implemented' });
});

// list all tweets
router.get('/', (req, res) => {
	res.status(501).json({ error: 'Not Implemented' });
});

// get one tweet
router.get('/:id', (req, res) => {
	const { id } = req.params;
	res.status(501).json({ error: `Not Implemented for Tweet ${id}` });
});

// update one tweet
router.put('/:id', (req, res) => {
	const { id } = req.params;
	res.status(501).json({ error: `Not Implemented for Tweet ${id}` });
});

// delete one tweet
router.delete('/:id', (req, res) => {
	const { id } = req.params;
	res.status(501).json({ error: `Not Implemented for Tweet ${id}` });
});

export default router;
