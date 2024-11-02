import { Router } from 'express';

const router = Router();

// Basic health check
router.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

export default router;
