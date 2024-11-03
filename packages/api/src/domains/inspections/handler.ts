import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Inspection } from './entities/Inspection';
import { logger } from '../../utils/logger';

const inspectionRepository = AppDataSource.getRepository(Inspection);

// Get all inspections
export async function getInspections(req: Request, res: Response) {
    try {
        const { status, property_id } = req.query;
        const queryBuilder = inspectionRepository
            .createQueryBuilder('inspection')
            .leftJoinAndSelect('inspection.property', 'property');

        if (status) {
            queryBuilder.andWhere('inspection.status = :status', { status });
        }
        if (property_id) {
            queryBuilder.andWhere('inspection.property_id = :propertyId', { propertyId: property_id });
        }

        const [inspections, total] = await queryBuilder.getManyAndCount();
        return res.json({ inspections, total });
    } catch (error) {
        logger.error('Error getting inspections:', error);
        return res.status(500).json({ 
            message: 'Failed to get inspections',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Get inspection by ID
export async function getInspection(req: Request, res: Response) {
    try {
        const inspection = await inspectionRepository.findOne({
            where: { id: req.params.id },
            relations: ['property']
        });

        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }

        return res.json(inspection);
    } catch (error) {
        logger.error('Error getting inspection:', error);
        return res.status(500).json({ 
            message: 'Failed to get inspection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Create new inspection
export async function createInspection(req: Request, res: Response) {
    try {
        // Validate required fields
        const { title, property_id } = req.body;
        if (!title?.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Inspection title is required'
            });
        }
        if (!property_id) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Property ID is required'
            });
        }

        const inspection = inspectionRepository.create({
            ...req.body,
            status: req.body.status || 'pending'
        });

        const savedInspection = await inspectionRepository.save(inspection);
        logger.info('Inspection created:', savedInspection);

        // Return inspection with property relation
        const fullInspection = await inspectionRepository.findOne({
            where: { id: savedInspection.id },
            relations: ['property']
        });

        return res.status(201).json(fullInspection);
    } catch (error) {
        logger.error('Error creating inspection:', error);
        return res.status(500).json({ 
            message: 'Failed to create inspection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update inspection
export async function updateInspection(req: Request, res: Response) {
    try {
        const inspection = await inspectionRepository.findOne({
            where: { id: req.params.id },
            relations: ['property']
        });

        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }

        // Validate fields if being updated
        const { title, property_id } = req.body;
        if (title !== undefined && !title.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Inspection title cannot be empty'
            });
        }
        if (property_id !== undefined && !property_id) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Property ID cannot be empty'
            });
        }

        inspectionRepository.merge(inspection, req.body);
        const updatedInspection = await inspectionRepository.save(inspection);
        logger.info('Inspection updated:', updatedInspection);

        return res.json(updatedInspection);
    } catch (error) {
        logger.error('Error updating inspection:', error);
        return res.status(500).json({ 
            message: 'Failed to update inspection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Archive inspection
export async function archiveInspection(req: Request, res: Response) {
    try {
        const inspection = await inspectionRepository.findOne({
            where: { id: req.params.id }
        });

        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }

        inspection.status = 'cancelled';
        const archivedInspection = await inspectionRepository.save(inspection);
        logger.info('Inspection archived:', archivedInspection);

        return res.json({ success: true });
    } catch (error) {
        logger.error('Error archiving inspection:', error);
        return res.status(500).json({ 
            message: 'Failed to archive inspection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
