import { Router } from 'express';
import { listAccounts } from './list';
import { createAccount } from './create';
import { updateAccount } from './update';

const router = Router();

router.get('/', listAccounts);
router.post('/', createAccount);
router.put('/:id', updateAccount);

export default router;
