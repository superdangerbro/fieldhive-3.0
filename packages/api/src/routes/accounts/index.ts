import { Router } from 'express';
import { getAccounts } from './list';
import { createAccount } from './create';
import { updateAccount } from './update';
import { assignProperty } from './property/assign';
import { updatePropertyAssignment } from './property/update';
import { removePropertyAssignment } from './property/remove';

const accountRouter = Router();

// Account routes
accountRouter.get('/', getAccounts);
accountRouter.post('/', createAccount);
accountRouter.patch('/:id', updateAccount);

// Property assignment routes
accountRouter.post('/:id/properties', assignProperty);
accountRouter.patch('/:id/properties/:propertyId', updatePropertyAssignment);
accountRouter.delete('/:id/properties/:propertyId', removePropertyAssignment);

export default accountRouter;
