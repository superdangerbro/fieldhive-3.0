import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { 
    AccountType, 
    AccountStatus, 
    CreateAccountDto, 
    UpdateAccountDto,
    VALID_TYPES,
    VALID_STATUSES
} from './types';

/**
 * Type guards for account fields
 */
export const isValidType = (type: string): type is AccountType => {
    return VALID_TYPES.includes(type as AccountType);
};

export const isValidStatus = (status: string): status is AccountStatus => {
    return VALID_STATUSES.includes(status as AccountStatus);
};

/**
 * Validate create account request
 */
export const validateCreateAccount = (req: Request, res: Response, next: NextFunction) => {
    const {
        name,
        type,
        billing_address
    } = req.body as CreateAccountDto;

    logger.info('Validating create account request:', {
        name,
        type
    });

    // Check required fields
    if (!name || !type) {
        return res.status(400).json({
            error: 'Bad request',
            message: 'Missing required fields: name or type'
        });
    }

    // Validate type
    if (!isValidType(type)) {
        return res.status(400).json({
            error: 'Bad request',
            message: `Invalid account type. Must be one of: ${VALID_TYPES.join(', ')}`
        });
    }

    // Validate billing address if provided
    if (billing_address && !validateAddress(billing_address)) {
        return res.status(400).json({
            error: 'Bad request',
            message: 'Invalid billing address data'
        });
    }

    next();
};

/**
 * Validate update account request
 */
export const validateUpdateAccount = (req: Request, res: Response, next: NextFunction) => {
    const {
        type,
        status,
        billing_address
    } = req.body as UpdateAccountDto;

    logger.info('Validating update account request:', req.body);

    // Validate type if provided
    if (type && !isValidType(type)) {
        return res.status(400).json({
            error: 'Bad request',
            message: `Invalid account type. Must be one of: ${VALID_TYPES.join(', ')}`
        });
    }

    // Validate status if provided
    if (status && !isValidStatus(status)) {
        return res.status(400).json({
            error: 'Bad request',
            message: `Invalid account status. Must be one of: ${VALID_STATUSES.join(', ')}`
        });
    }

    // Validate billing address if provided
    if (billing_address && !validateAddress(billing_address)) {
        return res.status(400).json({
            error: 'Bad request',
            message: 'Invalid billing address data'
        });
    }

    next();
};

/**
 * Validate address data
 */
export const validateAddress = (address: any) => {
    if (!address) return true; // Optional

    const requiredFields = ['address1', 'city', 'province', 'postal_code', 'country'];
    return requiredFields.every(field => address[field]);
};

/**
 * Validate property link request
 */
export const validatePropertyLink = (req: Request, res: Response, next: NextFunction) => {
    const { property_id, role } = req.body;

    if (!property_id) {
        return res.status(400).json({
            error: 'Bad request',
            message: 'Missing required field: property_id'
        });
    }

    next();
};

/**
 * Combine all validations for create account
 */
export const validateCreateAccountRequest = [
    validateCreateAccount
];

/**
 * Combine all validations for update account
 */
export const validateUpdateAccountRequest = [
    validateUpdateAccount
];

/**
 * Example Usage:
 * ```typescript
 * router.post('/', validateCreateAccountRequest, createAccount);
 * router.put('/:id', validateUpdateAccountRequest, updateAccount);
 * router.post('/:id/properties', validatePropertyLink, linkProperty);
 * ```
 */
