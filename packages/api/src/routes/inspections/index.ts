import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Get inspections for equipment with optional pagination
router.get('/', async (req, res) => {
    try {
        const { equipment_id, page, limit } = req.query;
        const isPaginated = page !== undefined && limit !== undefined;

        if (!equipment_id || Array.isArray(equipment_id)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Valid equipment ID is required'
            });
        }

        let inspectionsQuery = `
            SELECT 
                inspection_id,
                equipment_id,
                inspected_by,
                barcode,
                notes,
                image_url,
                created_at,
                updated_at,
                status
            FROM equipment_inspections 
            WHERE equipment_id = $1 
            ORDER BY created_at DESC
        `;

        const queryParams: (string | number)[] = [equipment_id];

        if (isPaginated && typeof page === 'string' && typeof limit === 'string') {
            const offset = (Number(page) - 1) * Number(limit);
            inspectionsQuery += ' LIMIT $2 OFFSET $3';
            queryParams.push(limit, String(offset));
        }

        const [inspections, totalResult] = await Promise.all([
            AppDataSource.query(inspectionsQuery, queryParams),
            AppDataSource.query(
                `SELECT COUNT(*) as total
                FROM equipment_inspections 
                WHERE equipment_id = $1`,
                [equipment_id]
            )
        ]);

        const total = Number(totalResult[0].total);

        const response: {
            inspections: any[];
            total: number;
            page?: number;
            limit?: number;
        } = {
            inspections,
            total
        };

        if (isPaginated && typeof page === 'string' && typeof limit === 'string') {
            response.page = Number(page);
            response.limit = Number(limit);
        }

        res.json(response);
    } catch (error) {
        logger.error('Error fetching inspections:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Failed to fetch inspections'
        });
    }
});

// Create new inspection
router.post('/', async (req, res) => {
    try {
        const { 
            equipment_id,
            barcode,
            notes,
            image_url,
            status,
            inspected_by
        } = req.body;

        if (!inspected_by) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'inspected_by is required'
            });
        }

        const [inspection] = await AppDataSource.query(
            `INSERT INTO equipment_inspections (
                inspection_id,
                equipment_id,
                inspected_by,
                barcode,
                notes,
                image_url,
                status,
                created_at,
                updated_at
            ) VALUES (
                uuid_generate_v4(),
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                NOW(),
                NOW()
            ) RETURNING 
                inspection_id,
                equipment_id,
                inspected_by,
                barcode,
                notes,
                image_url,
                status,
                created_at,
                updated_at`,
            [
                equipment_id,
                inspected_by,
                barcode || null,
                notes || null,
                image_url || null,
                status || 'active'
            ]
        );

        res.status(201).json(inspection);
    } catch (error) {
        logger.error('Error creating inspection:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Failed to create inspection'
        });
    }
});

export default router;
