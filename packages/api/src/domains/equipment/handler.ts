import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Equipment } from './entities/Equipment';
import { logger } from '../../utils/logger';
import { DeepPartial } from 'typeorm';

const equipmentRepository = AppDataSource.getRepository(Equipment);

interface LocationInput {
    latitude: number;
    longitude: number;
}

interface CreateEquipmentBody {
    job_id: string;
    equipment_type_id: string;
    location?: LocationInput;
    status?: string;
    is_georeferenced?: boolean;
}

interface UpdateEquipmentBody {
    job_id?: string;
    equipment_type_id?: string;
    location?: LocationInput | null;
    status?: string;
    is_georeferenced?: boolean;
}

// Get all equipment with optional filters
export async function getEquipment(req: Request, res: Response) {
    try {
        const { type, status, bounds } = req.query;
        const queryBuilder = equipmentRepository
            .createQueryBuilder('equipment');

        if (type) {
            queryBuilder.andWhere('equipment.equipment_type_id = :type', { type });
        }
        if (status) {
            queryBuilder.andWhere('equipment.status = :status', { status });
        }

        // If bounds are provided, filter by location
        if (bounds) {
            const [west, south, east, north] = (bounds as string).split(',').map(Number);
            queryBuilder.andWhere(`
                ST_Intersects(
                    equipment.location,
                    ST_MakeEnvelope(:west, :south, :east, :north, 4326)
                )
            `, { west, south, east, north });
        }

        const [equipment, total] = await queryBuilder.getManyAndCount();

        // Transform data for frontend using toJSON
        const transformedEquipment = equipment.map(eq => eq.toJSON());

        return res.json({ equipment: transformedEquipment, total });
    } catch (error) {
        logger.error('Error getting equipment:', error);
        return res.status(500).json({ 
            message: 'Failed to get equipment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Get single equipment by ID
export async function getEquipmentById(req: Request, res: Response) {
    try {
        const equipment = await equipmentRepository.findOne({ 
            where: { equipment_id: req.params.id }
        });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        return res.json(equipment.toJSON());
    } catch (error) {
        logger.error('Error getting equipment:', error);
        return res.status(500).json({ 
            message: 'Failed to get equipment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Create new equipment
export async function createEquipment(req: Request<any, any, CreateEquipmentBody>, res: Response) {
    try {
        // Validate required fields
        const { job_id, equipment_type_id, location } = req.body;
        if (!job_id) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Job ID is required'
            });
        }
        if (!equipment_type_id) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Equipment type ID is required'
            });
        }

        // Create equipment instance
        const equipment = equipmentRepository.create({
            job_id,
            equipment_type_id,
            status: req.body.status || 'active',
            is_georeferenced: req.body.is_georeferenced ?? true
        });

        // Handle location if provided
        if (location?.latitude !== undefined && location?.longitude !== undefined) {
            equipment.setLocation(location.latitude, location.longitude);
        }

        const savedEquipment = await equipmentRepository.save(equipment);
        logger.info('Equipment created:', savedEquipment.toJSON());

        return res.status(201).json(savedEquipment.toJSON());
    } catch (error) {
        logger.error('Error creating equipment:', error);
        return res.status(500).json({ 
            message: 'Failed to create equipment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update equipment
export async function updateEquipment(req: Request<any, any, UpdateEquipmentBody>, res: Response) {
    try {
        const equipment = await equipmentRepository.findOne({ 
            where: { equipment_id: req.params.id }
        });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        const { location, ...updateData } = req.body;

        // Handle location update
        if (location !== undefined) {
            if (location === null) {
                equipment.clearLocation();
            } else if (location.latitude !== undefined && location.longitude !== undefined) {
                equipment.setLocation(location.latitude, location.longitude);
            }
        }

        // Update other fields
        const mergeData: DeepPartial<Equipment> = {
            ...updateData,
            job_id: updateData.job_id,
            equipment_type_id: updateData.equipment_type_id,
            status: updateData.status,
            is_georeferenced: updateData.is_georeferenced
        };

        equipmentRepository.merge(equipment, mergeData);
        const updatedEquipment = await equipmentRepository.save(equipment);
        logger.info('Equipment updated:', updatedEquipment.toJSON());

        return res.json(updatedEquipment.toJSON());
    } catch (error) {
        logger.error('Error updating equipment:', error);
        return res.status(500).json({ 
            message: 'Failed to update equipment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Archive equipment
export async function archiveEquipment(req: Request, res: Response) {
    try {
        const equipment = await equipmentRepository.findOne({ 
            where: { equipment_id: req.params.id } 
        });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        equipment.status = 'inactive';
        const archivedEquipment = await equipmentRepository.save(equipment);
        logger.info('Equipment archived:', archivedEquipment.toJSON());

        return res.json(archivedEquipment.toJSON());
    } catch (error) {
        logger.error('Error archiving equipment:', error);
        return res.status(500).json({ 
            message: 'Failed to archive equipment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
