import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Get all jobs with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        const [jobs, total] = await Promise.all([
            AppDataSource.query(
                `SELECT 
                    j.job_id,
                    j.job_type_id,
                    j.property_id,
                    j.status,
                    j.notes,
                    j.created_at as "createdAt",
                    j.updated_at as "updatedAt",
                    jsonb_build_object(
                        'job_type_id', jt.job_type_id,
                        'name', jt.name
                    ) as job_type,
                    jsonb_build_object(
                        'property_id', p.property_id,
                        'name', p.name,
                        'address', CONCAT_WS(', ', p.address1, p.city, p.province)
                    ) as property
                FROM jobs j
                JOIN job_types jt ON jt.job_type_id = j.job_type_id
                JOIN properties p ON p.property_id = j.property_id
                ORDER BY j.created_at DESC
                LIMIT $1 OFFSET $2`,
                [pageSize, offset]
            ),
            AppDataSource.query('SELECT COUNT(*) as count FROM jobs')
        ]);

        res.json({
            jobs,
            total: parseInt(total[0].count),
            page,
            pageSize
        });
    } catch (error) {
        logger.error('Error fetching jobs:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch jobs'
        });
    }
});

// Create new job
router.post('/', async (req, res) => {
    try {
        const { property_id, job_type_id, notes } = req.body;

        if (!property_id || !job_type_id) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Property ID and Job Type ID are required'
            });
        }

        // Create job
        const [job] = await AppDataSource.query(
            `INSERT INTO jobs (
                property_id,
                job_type_id,
                notes,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING 
                job_id,
                property_id,
                job_type_id,
                status,
                notes,
                created_at as "createdAt",
                updated_at as "updatedAt"`,
            [property_id, job_type_id, notes]
        );

        res.status(201).json(job);
    } catch (error) {
        logger.error('Error creating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create job'
        });
    }
});

// Update job
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const [job] = await AppDataSource.query(
            `UPDATE jobs 
            SET 
                status = COALESCE($1, status),
                notes = COALESCE($2, notes),
                updated_at = NOW()
            WHERE job_id = $3
            RETURNING 
                job_id,
                property_id,
                job_type_id,
                status,
                notes,
                created_at as "createdAt",
                updated_at as "updatedAt"`,
            [status, notes, id]
        );

        if (!job) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        res.json(job);
    } catch (error) {
        logger.error('Error updating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update job'
        });
    }
});

// Delete job
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await AppDataSource.query(
            'DELETE FROM jobs WHERE job_id = $1 RETURNING job_id',
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete job'
        });
    }
});

export default router;
