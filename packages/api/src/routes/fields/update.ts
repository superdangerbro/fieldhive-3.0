import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Update field
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, area, boundary } = req.body;

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name) {
            updates.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        if (area) {
            updates.push(`area = $${paramCount}`);
            values.push(area);
            paramCount++;
        }

        if (boundary) {
            updates.push(`boundary = $${paramCount}`);
            values.push(boundary);
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
            UPDATE field
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        if (!result || result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Field not found'
            });
        }

        res.json(result[0]);
    } catch (error) {
        logger.error('Error updating field:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update field'
        });
    }
});

export default router;
