import { Router } from 'express';
import basicRouter from './basic';
import detailedRouter from './detailed';

const router = Router();

router.use('/basic', basicRouter);
router.use('/detailed', detailedRouter);

export default router;
