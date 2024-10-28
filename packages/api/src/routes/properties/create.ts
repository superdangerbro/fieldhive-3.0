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
            address1,
            address2,
            city,
            province,
            postal_code,
            country,
            location, 
            boundary,
            type,
            accountConnections 
        } = req.body;

        if (!name || !address1 || !city || !province || !postal_code || !location || !accountConnections?.length) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name, address fields (address1, city, province, postal_code), location, and at least one account connection are required'
            });
        }

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create property
            const [property] = await AppDataSource.query(
                `INSERT INTO properties (
                    name,
                    address1,
                    address2,
                    city,
                    province,
                    postal_code,
                    country,
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
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    ST_SetSRID(ST_GeomFromGeoJSON($8), 4326),
                    CASE WHEN $9::jsonb IS NOT NULL 
                        THEN ST_SetSRID(ST_GeomFromGeoJSON($9), 4326)
                        ELSE NULL
                    END,
                    $10,
                    'active',
                    NOW(), 
                    NOW()
                )
                RETURNING 
                    property_id as id,
                    name,
                    address1,
                    address2,
                    city,
                    province,
                    postal_code as "postalCode",
                    country,
                    ST_AsGeoJSON(location)::jsonb as location,
                    ST_AsGeoJSON(boundary)::jsonb as boundary,
                    type,
                    status,
                    created_at as "createdAt",
                    updated_at as "updatedAt"`,
                [
                    name,
                    address1,
                    address2 || null,
                    city,
                    province,
                    postal_code,
                    country || 'Canada',
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

            // Format the address for the response
            const formattedAddress = `${property.address1}, ${property.city}, ${property.province} ${property.postalCode}`;

            const response: PropertyResponse = {
                ...property,
                address: formattedAddress,
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
