import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Get field equipment within bounds
router.get('/', async (req, res) => {
    try {
        const { bounds } = req.query;
        
        if (!bounds) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Map bounds are required'
            });
        }

        const [west, south, east, north] = (bounds as string).split(',').map(Number);
        
        // Create a polygon from the bounds
        const boundsPolygon = `POLYGON((
            ${west} ${south},
            ${east} ${south},
            ${east} ${north},
            ${west} ${north},
            ${west} ${south}
        ))`;

        const equipment = await AppDataSource.query(
            `SELECT 
                fe.equipment_id,
                fe.job_id,
                fe.equipment_type_id,
                ST_AsGeoJSON(fe.location)::jsonb as location,
                fe.is_georeferenced,
                fe.created_at,
                fe.updated_at,
                et.name as equipment_type_name,
                j.status as job_status,
                p.name as property_name,
                p.address1 as property_address,
                a.name as account_name,
                jsonb_build_object(
                    'id', et.equipment_type_id,
                    'name', et.name
                ) as equipment_type,
                jsonb_build_object(
                    'id', j.job_id,
                    'status', j.status,
                    'job_type', jt.name
                ) as job,
                jsonb_build_object(
                    'id', p.property_id,
                    'name', p.name,
                    'address', p.address1
                ) as property,
                jsonb_build_object(
                    'id', a.account_id,
                    'name', a.name
                ) as account
            FROM field_equipment fe
            JOIN equipment_types et ON et.equipment_type_id = fe.equipment_type_id
            JOIN jobs j ON j.job_id = fe.job_id
            JOIN job_types jt ON jt.job_type_id = j.job_type_id
            JOIN properties p ON p.property_id = j.property_id
            JOIN properties_accounts_join paj ON paj.property_id = p.property_id
            JOIN accounts a ON a.account_id = paj.account_id
            WHERE ST_Intersects(
                fe.location,
                ST_SetSRID(ST_GeomFromText($1), 4326)
            )`,
            [boundsPolygon]
        );

        res.json(equipment);
    } catch (error) {
        logger.error('Error fetching field equipment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch field equipment',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Create new field equipment
router.post('/', async (req, res) => {
    try {
        const { job_id, equipment_type_id, location, is_georeferenced } = req.body;

        logger.info('Creating field equipment with data:', { 
            job_id, 
            equipment_type_id, 
            location,
            is_georeferenced 
        });

        if (!job_id || !equipment_type_id || !location) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Job ID, Equipment Type ID, and location are required'
            });
        }

        // Verify job and equipment type exist
        const [jobExists, equipmentTypeExists] = await Promise.all([
            AppDataSource.query(
                'SELECT job_id FROM jobs WHERE job_id = $1',
                [job_id]
            ),
            AppDataSource.query(
                'SELECT equipment_type_id FROM equipment_types WHERE equipment_type_id = $1',
                [equipment_type_id]
            )
        ]);

        if (!jobExists.length) {
            logger.error('Job not found:', job_id);
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        if (!equipmentTypeExists.length) {
            logger.error('Equipment type not found:', equipment_type_id);
            return res.status(404).json({
                error: 'Not found',
                message: 'Equipment type not found'
            });
        }

        // Create field equipment
        const [equipment] = await AppDataSource.query(
            `INSERT INTO field_equipment (
                job_id, 
                equipment_type_id, 
                location,
                is_georeferenced,
                created_at,
                updated_at
            ) VALUES (
                $1, 
                $2, 
                ST_SetSRID(ST_GeomFromGeoJSON($3), 4326),
                $4,
                NOW(),
                NOW()
            ) RETURNING 
                equipment_id,
                job_id,
                equipment_type_id,
                ST_AsGeoJSON(location)::jsonb as location,
                is_georeferenced,
                created_at,
                updated_at`,
            [
                job_id,
                equipment_type_id,
                JSON.stringify(location),
                is_georeferenced
            ]
        );

        logger.info('Field equipment created:', equipment);

        res.status(201).json(equipment);
    } catch (error) {
        logger.error('Error creating field equipment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create field equipment',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Update field equipment
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { equipment_type_id } = req.body;

        logger.info('Updating field equipment:', { id, equipment_type_id });

        // Check if equipment exists
        const [equipmentExists] = await AppDataSource.query(
            'SELECT equipment_id FROM field_equipment WHERE equipment_id = $1',
            [id]
        );

        if (!equipmentExists) {
            logger.error('Equipment not found:', id);
            return res.status(404).json({
                error: 'Not found',
                message: 'Equipment not found'
            });
        }

        // Check if equipment type exists
        const [equipmentTypeExists] = await AppDataSource.query(
            'SELECT equipment_type_id FROM equipment_types WHERE equipment_type_id = $1',
            [equipment_type_id]
        );

        if (!equipmentTypeExists) {
            logger.error('Equipment type not found:', equipment_type_id);
            return res.status(404).json({
                error: 'Not found',
                message: 'Equipment type not found'
            });
        }

        // Update equipment
        const [equipment] = await AppDataSource.query(
            `UPDATE field_equipment 
            SET 
                equipment_type_id = $1,
                updated_at = NOW()
            WHERE equipment_id = $2
            RETURNING 
                equipment_id,
                job_id,
                equipment_type_id,
                ST_AsGeoJSON(location)::jsonb as location,
                is_georeferenced,
                created_at,
                updated_at`,
            [equipment_type_id, id]
        );

        logger.info('Field equipment updated:', equipment);

        res.json(equipment);
    } catch (error) {
        logger.error('Error updating field equipment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update field equipment',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Delete field equipment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        logger.info('Deleting field equipment:', id);

        // Check if equipment exists
        const [equipmentExists] = await AppDataSource.query(
            'SELECT equipment_id FROM field_equipment WHERE equipment_id = $1',
            [id]
        );

        if (!equipmentExists) {
            logger.error('Equipment not found:', id);
            return res.status(404).json({
                error: 'Not found',
                message: 'Equipment not found'
            });
        }

        // Delete equipment
        await AppDataSource.query(
            'DELETE FROM field_equipment WHERE equipment_id = $1',
            [id]
        );

        logger.info('Field equipment deleted:', id);

        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting field equipment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete field equipment',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;
