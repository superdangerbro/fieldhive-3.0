import { Router } from 'express';
import { getAccountTypes, updateAccountTypes } from './handler';

const router = Router();

router.get('/accounts/types', getAccountTypes);
router.put('/accounts/types', updateAccountTypes);

export default router;
