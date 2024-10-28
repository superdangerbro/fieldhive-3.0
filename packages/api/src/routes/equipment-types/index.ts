import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Get all equipment types
router.get('/', async (req, res) => {
    try {
        const equipmentTypes = await AppDataSource.query(`
            SELECT 
                equipment_type_id,
                name,
                created_at,
                updated_at
            FROM equipment_types
            ORDER BY name ASC
        `);

        logger.info('Fetched equipment types:', equipmentTypes.length);

        res.json(equipmentTypes);
    } catch (error) {
        logger.error('Error fetching equipment types:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch equipment types',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Create new equipment type
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        logger.info('Creating equipment type:', { name });

        if (!name) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name is required'
            });
        }

        // Create equipment type
        const [equipmentType] = await AppDataSource.query(
            `INSERT INTO equipment_types (name)
             VALUES ($1)
             RETURNING equipment_type_id, name, created_at, updated_at`,
            [name]
        );

        logger.info('Equipment type created:', equipmentType);

        res.status(201).json(equipmentType);
    } catch (error) {
        logger.error('Error creating equipment type:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create equipment type',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Update equipment type
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        logger.info('Updating equipment type:', { id, name });

        if (!name) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name is required'
            });
        }

        // Update equipment type
        const [equipmentType] = await AppDataSource.query(
            `UPDATE equipment_types
             SET name = $1, updated_at = NOW()
             WHERE equipment_type_id = $2
             RETURNING equipment_type_id, name, created_at, updated_at`,
            [name, id]
        );

        if (!equipmentType) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Equipment type not found'
            });
        }

        logger.info('Equipment type updated:', equipmentType);

        res.json(equipmentType);
    } catch (error) {
        logger.error('Error updating equipment type:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update equipment type',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Delete equipment type
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        logger.info('Deleting equipment type:', id);

        // Check if equipment type is in use
        const [inUse] = await AppDataSource.query(
            `SELECT COUNT(*) as count
             FROM field_equipment
             WHERE equipment_type_id = $1`,
            [id]
        );

        if (parseInt(inUse.count) > 0) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Equipment type is in use and cannot be deleted'
            });
        }

        // Delete equipment type
        const result = await AppDataSource.query(
            `DELETE FROM equipment_types
             WHERE equipment_type_id = $1
             RETURNING equipment_type_id`,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Equipment type not found'
            });
        }

        logger.info('Equipment type deleted:', id);

        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting equipment type:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete equipment type',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;
