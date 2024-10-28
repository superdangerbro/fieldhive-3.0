import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Get all job types
router.get('/', async (req, res) => {
    try {
        logger.info('Fetching job types...');
        const jobTypes = await AppDataSource.query(
            `SELECT 
                job_type_id as id,
                name,
                created_at as "createdAt",
                updated_at as "updatedAt"
            FROM job_types
            ORDER BY name ASC`
        );

        logger.info('Job types fetched:', jobTypes);
        res.json({ jobTypes });
    } catch (error) {
        logger.error('Error fetching job types:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch job types'
        });
    }
});

// Create new job type
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name is required'
            });
        }

        // Check if job type already exists
        const existing = await AppDataSource.query(
            'SELECT name FROM job_types WHERE LOWER(name) = LOWER($1)',
            [name.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Job type already exists'
            });
        }

        // Create new job type
        const [jobType] = await AppDataSource.query(
            `INSERT INTO job_types (
                name,
                created_at,
                updated_at
            )
            VALUES ($1, NOW(), NOW())
            RETURNING 
                job_type_id as id,
                name,
                created_at as "createdAt",
                updated_at as "updatedAt"`,
            [name.trim()]
        );

        res.status(201).json(jobType);
    } catch (error) {
        logger.error('Error creating job type:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create job type'
        });
    }
});

// Delete job type
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await AppDataSource.query(
            'DELETE FROM job_types WHERE job_type_id = $1 RETURNING job_type_id',
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job type not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting job type:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete job type'
        });
    }
});

export default router;
