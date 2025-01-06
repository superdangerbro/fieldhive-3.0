import { Router } from 'express';
import { getCurrentUser } from './handlers';

const router = Router();

router.get('/me', getCurrentUser);

export { router as authRouter };
