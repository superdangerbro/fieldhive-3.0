import { Router } from 'express';
import basicRouter from './basic';
import detailedRouter from './detailed';

const router = Router();

router.use(basicRouter);
router.use(detailedRouter);

export default router;
