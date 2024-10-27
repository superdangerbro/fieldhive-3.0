import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Get all fields
router.get('/', async (req, res) => {
    try {
        const fields = await AppDataSource.query(`
            SELECT 
                id,
                name,
                area,
                boundary,
                property_id,
                created_at,
                updated_at
            FROM field
            ORDER BY created_at DESC
        `);
        res.json(fields);
    } catch (error) {
        logger.error('Error fetching fields:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch fields'
        });
    }
});

// Get field by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const field = await AppDataSource.query(`
            SELECT 
                id,
                name,
                area,
                boundary,
                property_id,
                created_at,
                updated_at
            FROM field
            WHERE id = $1
        `, [id]);

        if (!field || field.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Field not found'
            });
        }

        res.json(field[0]);
    } catch (error) {
        logger.error('Error fetching field:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch field'
        });
    }
});

export default router;
