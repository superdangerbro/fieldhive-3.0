import { Router } from 'express';
import statusesRouter from './statuses/route';
import typesRouter from './types/route';

const router = Router();

router.use('/statuses', statusesRouter);
router.use('/types', typesRouter);

export default router;
