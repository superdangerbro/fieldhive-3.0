import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Create new field
router.post('/', async (req, res) => {
    try {
        const { name, area, boundary, propertyId } = req.body;

        if (!name || !boundary || !propertyId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name, boundary, and property ID are required'
            });
        }

        const result = await AppDataSource.query(`
            INSERT INTO field (name, area, boundary, property_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [name, area, boundary, propertyId]);

        res.status(201).json(result[0]);
    } catch (error) {
        logger.error('Error creating field:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create field'
        });
    }
});

export default router;
