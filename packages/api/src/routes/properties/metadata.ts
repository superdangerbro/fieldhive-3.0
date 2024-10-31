import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

export const updatePropertyMetadata = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { property_type, status } = req.body;

    try {
        // Build the update query for metadata fields
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (property_type !== undefined) {
            updates.push(`property_type = $${paramCount}`);
            params.push(property_type);
            paramCount++;
        }

        if (status !== undefined) {
            updates.push(`status = $${paramCount}`);
            params.push(status);
            paramCount++;
        }

        updates.push(`updated_at = NOW()`);

        // Update property if there are fields to update
        if (updates.length > 0) {
            const updateQuery = `
                UPDATE properties 
                SET ${updates.join(', ')}
                WHERE property_id = $${paramCount}
                RETURNING *
            `;
            logger.info('Executing metadata update query:', {
                query: updateQuery,
                params: [...params, id]
            });
            
            const [updatedProperty] = await AppDataSource.query(updateQuery, [...params, id]);

            if (!updatedProperty) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Property not found'
                });
            }

            res.json(updatedProperty);
        } else {
            res.status(400).json({
                error: 'Bad request',
                message: 'No metadata fields provided for update'
            });
        }
    } catch (error) {
        logger.error('Error updating property metadata:', {
            propertyId: id,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error,
            requestBody: req.body
        });

        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Failed to update property metadata',
            details: error instanceof Error ? error.stack : String(error)
        });
    }
};
