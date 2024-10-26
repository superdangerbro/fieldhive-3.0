import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

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

// Update sensor
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, location, status } = req.body;

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name) {
            updates.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        if (type) {
            updates.push(`type = $${paramCount}`);
            values.push(type);
            paramCount++;
        }

        if (location) {
            updates.push(`location = $${paramCount}`);
            values.push(location);
            paramCount++;
        }

        if (status) {
            updates.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'No updates provided'
            });
        }

        values.push(id);
        const result = await AppDataSource.query(`
            UPDATE sensor
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        if (!result || result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Sensor not found'
            });
        }

        res.json(result[0]);
    } catch (error) {
        logger.error('Error updating sensor:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update sensor'
        });
    }
});

// Delete sensor
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await AppDataSource.query(`
            DELETE FROM sensor
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (!result || result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Sensor not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting sensor:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete sensor'
        });
    }
});

export default router;
