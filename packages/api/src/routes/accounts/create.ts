import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { CreateAccountDto } from '@fieldhive/shared';

export const createAccount = async (req: Request, res: Response) => {
    try {
        const { 
            name, 
            isCompany = false, 
            status = 'active',
            billingAddress 
        } = req.body as CreateAccountDto;

        if (!name || !billingAddress) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name and billing address are required'
            });
        }

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create account
            const [account] = await AppDataSource.query(
                `INSERT INTO accounts (name, is_company, status, created_at, updated_at)
                VALUES ($1, $2, $3, NOW(), NOW())
                RETURNING 
                    account_id as id,
                    name,
                    is_company as "isCompany",
                    status,
                    created_at as "createdAt",
                    updated_at as "updatedAt"`,
                [name, isCompany, status]
            );

            // Create billing address
            await AppDataSource.query(
                `INSERT INTO account_billing_address (
                    account_id,
                    address1,
                    address2,
                    city,
                    province,
                    "postalCode",
                    country
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    account.id,
                    billingAddress.address1,
                    billingAddress.address2,
                    billingAddress.city,
                    billingAddress.province,
                    billingAddress.postalCode,
                    billingAddress.country
                ]
            );

            await AppDataSource.query('COMMIT');

            const response = {
                ...account,
                billingAddress,
                properties: []
            };

            res.status(201).json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error creating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create account'
        });
    }
};
