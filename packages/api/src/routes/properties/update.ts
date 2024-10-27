import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { UpdatePropertyRequest, PropertyResponse } from '@fieldhive/shared';

const router = Router();

// Update property
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body as UpdatePropertyRequest;

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Update property
            const [property] = await AppDataSource.query(
                `UPDATE properties 
                SET 
                    name = COALESCE($1, name),
                    address = COALESCE($2, address),
                    location = CASE 
                        WHEN $3::jsonb IS NOT NULL 
                        THEN ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)
                        ELSE location
                    END,
                    boundary = CASE 
                        WHEN $4::jsonb IS NOT NULL 
                        THEN ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)
                        ELSE boundary
                    END,
                    type = COALESCE($5, type),
                    status = COALESCE($6, status),
                    updated_at = NOW()
                WHERE property_id = $7
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
                    updates.name,
                    updates.address,
                    updates.location ? JSON.stringify(updates.location) : null,
                    updates.boundary ? JSON.stringify(updates.boundary) : null,
                    updates.type,
                    updates.status,
                    id
                ]
            );

            if (!property) {
                await AppDataSource.query('ROLLBACK');
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Property not found'
                });
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
                [id]
            );

            await AppDataSource.query('COMMIT');

            const response: PropertyResponse = {
                ...property,
                accounts
            };

            res.json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error updating property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property'
        });
    }
});

export default router;
