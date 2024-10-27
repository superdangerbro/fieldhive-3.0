import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Delete field
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await AppDataSource.query(`
            DELETE FROM field
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (!result || result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Field not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting field:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete field'
        });
    }
});

export default router;
