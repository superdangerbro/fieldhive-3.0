import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Create new sensor
router.post('/', async (req, res) => {
    try {
        const { name, type, location, status = 'active' } = req.body;

        if (!name || !type || !location) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name, type, and location are required'
            });
        }

        const result = await AppDataSource.query(`
            INSERT INTO sensor (name, type, location, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [name, type, location, status]);

        res.status(201).json(result[0]);
    } catch (error) {
        logger.error('Error creating sensor:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create sensor'
        });
    }
});

export default router;
