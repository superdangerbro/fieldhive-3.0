import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { CreateAccountDto } from '@fieldhive/shared';

export const createAccount = async (req: Request, res: Response) => {
    try {
        const { 
            name, 
            type, 
            status = 'Active',
            address 
        } = req.body as CreateAccountDto;

        if (!name || !type || !address) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name, type, and address are required'
            });
        }

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create address first
            const [newAddress] = await AppDataSource.query(
                `INSERT INTO addresses (
                    address1,
                    address2,
                    city,
                    province,
                    postal_code,
                    country,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING address_id`,
                [
                    address.address1,
                    address.address2,
                    address.city,
                    address.province,
                    address.postal_code,
                    address.country
                ]
            );

            // Create account with billing address reference
            const [account] = await AppDataSource.query(
                `INSERT INTO accounts (
                    name,
                    type,
                    status,
                    billing_address_id,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING 
                    account_id,
                    name,
                    type,
                    status,
                    created_at,
                    updated_at`,
                [name, type, status, newAddress.address_id]
            );

            // Get the complete account with address
            const [completeAccount] = await AppDataSource.query(
                `SELECT 
                    a.account_id,
                    a.name,
                    a.type,
                    a.status,
                    a.created_at,
                    a.updated_at,
                    json_build_object(
                        'address_id', addr.address_id,
                        'address1', addr.address1,
                        'address2', addr.address2,
                        'city', addr.city,
                        'province', addr.province,
                        'postal_code', addr.postal_code,
                        'country', addr.country
                    ) AS billing_address
                FROM accounts a
                LEFT JOIN addresses addr ON addr.address_id = a.billing_address_id
                WHERE a.account_id = $1`,
                [account.account_id]
            );

            await AppDataSource.query('COMMIT');

            res.status(201).json({
                ...completeAccount,
                properties: []
            });
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
