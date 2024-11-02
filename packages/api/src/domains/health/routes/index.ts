import { Router } from 'express';
import { basicHealth, detailedHealth } from './handlers';

const router = Router();

// Basic health check
router.get('/', basicHealth);

// Detailed health check
router.get('/detailed', detailedHealth);

export default router;
