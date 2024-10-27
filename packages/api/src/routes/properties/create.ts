import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { CreatePropertyRequest, PropertyResponse } from '@fieldhive/shared';

const router = Router();

// Create new property
router.post('/', async (req, res) => {
    try {
        const { 
            name, 
            address, 
            location, 
            boundary,
            type,
            accountConnections 
        } = req.body as CreatePropertyRequest;

        if (!name || !address || !location || !accountConnections?.length) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name, address, location, and at least one account connection are required'
            });
        }

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create property
            const [property] = await AppDataSource.query(
                `INSERT INTO properties (
                    name, 
                    address, 
                    location, 
                    boundary,
                    type,
                    status,
                    created_at, 
                    updated_at
                )
                VALUES (
                    $1, 
                    $2, 
                    ST_SetSRID(ST_GeomFromGeoJSON($3), 4326),
                    CASE WHEN $4::jsonb IS NOT NULL 
                        THEN ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)
                        ELSE NULL
                    END,
                    $5,
                    'active',
                    NOW(), 
                    NOW()
                )
                RETURNING 
                    property_id as id,
                    name,
                    address,
                    ST_AsGeoJSON(location)::jsonb as location,
                    ST_AsGeoJSON(boundary)::jsonb as boundary,
                    type,
                    status,
                    created_at as "createdAt",
                    updated_at as "updatedAt"`,
                [
                    name, 
                    address, 
                    JSON.stringify(location),
                    boundary ? JSON.stringify(boundary) : null,
                    type
                ]
            );

            // Create account connections
            for (const connection of accountConnections) {
                await AppDataSource.query(
                    `INSERT INTO properties_accounts_join (
                        property_id, 
                        account_id, 
                        role
                    )
                    VALUES ($1, $2, $3)`,
                    [property.id, connection.accountId, connection.role]
                );
            }

            // Get account connections
            const accounts = await AppDataSource.query(
                `SELECT 
                    a.account_id as "accountId",
                    a.name,
                    paj.role
                FROM accounts a
                JOIN properties_accounts_join paj ON paj.account_id = a.account_id
                WHERE paj.property_id = $1`,
                [property.id]
            );

            await AppDataSource.query('COMMIT');

            const response: PropertyResponse = {
                ...property,
                accounts
            };

            res.status(201).json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error creating property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create property'
        });
    }
});

export default router;
