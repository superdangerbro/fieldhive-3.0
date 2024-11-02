import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Get all sensors
router.get('/', async (req, res) => {
    try {
        const sensors = await AppDataSource.query(`
            SELECT 
                id,
                name,
                type,
                status,
                location,
                created_at,
                updated_at
            FROM sensor
            ORDER BY created_at DESC
        `);
        res.json(sensors);
    } catch (error) {
        logger.error('Error fetching sensors:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch sensors'
        });
    }
});

// Get sensor by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sensor = await AppDataSource.query(`
            SELECT 
                id,
                name,
                type,
                status,
                location,
                created_at,
                updated_at
            FROM sensor
            WHERE id = $1
        `, [id]);

        if (!sensor || sensor.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Sensor not found'
            });
        }

        res.json(sensor[0]);
    } catch (error) {
        logger.error('Error fetching sensor:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch sensor'
        });
    }
});

export default router;
