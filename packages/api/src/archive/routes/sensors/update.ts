import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

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

export default router;
