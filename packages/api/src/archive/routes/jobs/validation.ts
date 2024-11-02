import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { JobStatus, CreateJobDto, UpdateJobDto, VALID_STATUSES } from './types';

/**
 * Type guard for job status
 */
export const isValidStatus = (status: string): status is JobStatus => {
    return VALID_STATUSES.includes(status as JobStatus);
};

/**
 * Validate create job request
 */
export const validateCreateJob = (req: Request, res: Response, next: NextFunction) => {
    const {
        title,
        propertyId,
        jobTypeId,
        status = 'pending',
    } = req.body as CreateJobDto;

    logger.info('Validating create job request:', {
        title,
        propertyId,
        jobTypeId,
        status
    });

    // Check required fields
    if (!title || !propertyId || !jobTypeId) {
        return res.status(400).json({
            error: 'Bad request',
            message: 'Missing required fields: title, propertyId, or jobTypeId'
        });
    }

    // Validate status
    if (status && !isValidStatus(status)) {
        return res.status(400).json({
            error: 'Bad request',
            message: 'Invalid status value'
        });
    }

    next();
};

/**
 * Validate update job request
 */
export const validateUpdateJob = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body as UpdateJobDto;

    logger.info('Validating update job request:', req.body);

    // Validate status if provided
    if (status && !isValidStatus(status)) {
        return res.status(400).json({
            error: 'Bad request',
            message: 'Invalid status value'
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
 * Validate custom addresses in job request
 */
export const validateCustomAddresses = (req: Request, res: Response, next: NextFunction) => {
    const { use_custom_addresses, custom_service_address, custom_billing_address } = req.body;

    if (use_custom_addresses) {
        if (custom_service_address && !validateAddress(custom_service_address)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Invalid service address data'
            });
        }

        if (custom_billing_address && !validateAddress(custom_billing_address)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Invalid billing address data'
            });
        }
    }

    next();
};

/**
 * Combine all validations for create job
 */
export const validateCreateJobRequest = [
    validateCreateJob,
    validateCustomAddresses
];

/**
 * Combine all validations for update job
 */
export const validateUpdateJobRequest = [
    validateUpdateJob,
    validateCustomAddresses
];
