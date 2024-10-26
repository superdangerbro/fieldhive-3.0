import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

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
