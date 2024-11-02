import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { CreateAccountDto, AccountResponse } from '../types';

export const createAccount = async (req: Request, res: Response) => {
    try {
        const {
            name,
            type,
            address
        } = req.body as CreateAccountDto & { address?: any };

        logger.info('Creating new account:', {
            name,
            type
        });

        await AppDataSource.query('BEGIN');

        try {
            let billingAddressId = null;
            if (address) {
                const [newAddress] = await AppDataSource.query(
                    'INSERT INTO addresses (address1, address2, city, province, postal_code, country, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
                    [
                        address.address1,
                        address.address2,
                        address.city,
                        address.province,
                        address.postal_code,
                        address.country
                    ]
                );
                billingAddressId = newAddress.address_id;
            }

            const [newAccount] = await AppDataSource.query(
                'INSERT INTO accounts (name, type, status, billing_address_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING account_id',
                [
                    name,
                    type,
                    'Active',
                    billingAddressId
                ]
            );

            await AppDataSource.query('COMMIT');

            const [createdAccount] = await AppDataSource.query(`
                SELECT 
                    a.account_id,
                    a.name,
                    a.type,
                    a.status,
                    a.created_at,
                    a.updated_at,
                    jsonb_build_object(
                        'address_id', ba.address_id,
                        'address1', ba.address1,
                        'address2', ba.address2,
                        'city', ba.city,
                        'province', ba.province,
                        'postal_code', ba.postal_code,
                        'country', ba.country
                    ) as billing_address,
                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'property_id', p.property_id,
                                    'name', p.name
                                )
                            )
                            FROM properties_accounts pa
                            JOIN properties p ON p.property_id = pa.property_id
                            WHERE pa.account_id = a.account_id
                        ),
                        '[]'::jsonb
                    ) as properties
                FROM accounts a
                LEFT JOIN addresses ba ON ba.address_id = a.billing_address_id
                WHERE a.account_id = $1
            `, [newAccount.account_id]);

            const response: AccountResponse = {
                ...createdAccount,
                properties: createdAccount.properties || []
            };

            logger.info('Successfully created account:', newAccount.account_id);
            res.status(201).json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error creating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
