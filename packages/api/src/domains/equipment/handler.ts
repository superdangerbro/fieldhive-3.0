import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Equipment } from './entities/Equipment';
import { logger } from '../../utils/logger';

const equipmentRepository = AppDataSource.getRepository(Equipment);

// Get all equipment with optional filters
export async function getEquipment(req: Request, res: Response) {
    try {
        const { type, status, name } = req.query;
        const queryBuilder = equipmentRepository
            .createQueryBuilder('equipment');

        if (type) {
            queryBuilder.andWhere('equipment.type = :type', { type });
        }
        if (status) {
            queryBuilder.andWhere('equipment.status = :status', { status });
        }
        if (name) {
            queryBuilder.andWhere('equipment.name ILIKE :name', { name: `%${name}%` });
        }

        const [equipment, total] = await queryBuilder.getManyAndCount();
        return res.json({ equipment, total });
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
            where: { id: req.params.id }
        });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        return res.json(equipment);
    } catch (error) {
        logger.error('Error getting equipment:', error);
        return res.status(500).json({ 
            message: 'Failed to get equipment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Create new equipment
export async function createEquipment(req: Request, res: Response) {
    try {
        // Validate required fields
        const { name, type, location } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Equipment name is required'
            });
        }

        // Create equipment instance
        const equipment = equipmentRepository.create({
            ...req.body,
            status: req.body.status || 'active'
        });

        // Handle location if provided
        if (location?.latitude !== undefined && location?.longitude !== undefined) {
            equipment.setLocation(location.latitude, location.longitude);
        }

        const savedEquipment = await equipmentRepository.save(equipment);
        logger.info('Equipment created:', savedEquipment);

        return res.status(201).json(savedEquipment);
    } catch (error) {
        logger.error('Error creating equipment:', error);
        return res.status(500).json({ 
            message: 'Failed to create equipment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update equipment
export async function updateEquipment(req: Request, res: Response) {
    try {
        const equipment = await equipmentRepository.findOne({ 
            where: { id: req.params.id }
        });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        // Validate name if being updated
        const { name, location } = req.body;
        if (name !== undefined && !name.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Equipment name cannot be empty'
            });
        }

        // Handle location update
        if (location !== undefined) {
            if (location === null) {
                equipment.clearLocation();
            } else if (location.latitude !== undefined && location.longitude !== undefined) {
                equipment.setLocation(location.latitude, location.longitude);
            }
        }

        // Update other fields
        equipmentRepository.merge(equipment, req.body);
        const updatedEquipment = await equipmentRepository.save(equipment);
        logger.info('Equipment updated:', updatedEquipment);

        return res.json(updatedEquipment);
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
            where: { id: req.params.id } 
        });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        equipment.status = 'inactive';
        const archivedEquipment = await equipmentRepository.save(equipment);
        logger.info('Equipment archived:', archivedEquipment);

        return res.json({ success: true });
    } catch (error) {
        logger.error('Error archiving equipment:', error);
        return res.status(500).json({ 
            message: 'Failed to archive equipment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
