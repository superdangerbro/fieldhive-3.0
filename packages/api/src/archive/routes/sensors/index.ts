import { Router } from 'express';
import listRouter from './list';
import createRouter from './create';
import updateRouter from './update';
import deleteRouter from './delete';

const router = Router();

router.use(listRouter);
router.use(createRouter);
router.use(updateRouter);
router.use(deleteRouter);

export default router;
