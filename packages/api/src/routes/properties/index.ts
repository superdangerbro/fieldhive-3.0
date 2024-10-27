import { Router } from 'express';
import listRouter from './list';
import createRouter from './create';
import updateRouter from './update';

const router = Router();

router.use(listRouter);
router.use(createRouter);
router.use(updateRouter);

export default router;
