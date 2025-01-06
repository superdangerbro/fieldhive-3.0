import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { EquipmentInspection } from '../entities/EquipmentInspection';
import { InspectionJobEquipment } from '../entities/InspectionJobEquipment';
import { logger } from '../../../utils/logger';
import { Point } from 'geojson';

const equipmentInspectionRepository = AppDataSource.getRepository(EquipmentInspection);
const inspectionJobEquipmentRepository = AppDataSource.getRepository(InspectionJobEquipment);

// Get all equipment inspections
export async function getEquipmentInspections(req: Request, res: Response) {
    try {
        const { equipment_id, inspector_id, job_id, property_id } = req.query;
        const queryBuilder = equipmentInspectionRepository
            .createQueryBuilder('inspection')
            .leftJoinAndSelect('inspection.equipment', 'equipment')
            .leftJoinAndSelect('inspection.inspector', 'inspector')
            .leftJoinAndSelect('inspection.job', 'job')
            .leftJoinAndSelect('inspection.property', 'property');

        if (equipment_id) {
            queryBuilder.andWhere('inspection.equipment_id = :equipmentId', { equipmentId: equipment_id });
        }
        if (inspector_id) {
            queryBuilder.andWhere('inspection.inspector_id = :inspectorId', { inspectorId: inspector_id });
        }
        if (job_id) {
            queryBuilder.andWhere('inspection.job_id = :jobId', { jobId: job_id });
        }
        if (property_id) {
            queryBuilder.andWhere('inspection.property_id = :propertyId', { propertyId: property_id });
        }

        const [inspections, total] = await queryBuilder.getManyAndCount();
        return res.json({ inspections, total });
    } catch (error) {
        logger.error('Error getting equipment inspections:', error);
        return res.status(500).json({ 
            message: 'Failed to get equipment inspections',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Get equipment inspection by ID
export async function getEquipmentInspection(req: Request, res: Response) {
    try {
        const inspection = await equipmentInspectionRepository.findOne({
            where: { inspectionId: req.params.id },
            relations: ['equipment', 'inspector', 'job', 'property']
        });

        if (!inspection) {
            return res.status(404).json({ message: 'Equipment inspection not found' });
        }

        return res.json(inspection);
    } catch (error) {
        logger.error('Error getting equipment inspection:', error);
        return res.status(500).json({ 
            message: 'Failed to get equipment inspection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Create new equipment inspection
export async function createEquipmentInspection(req: Request, res: Response) {
    try {
        const { 
            equipment_id, 
            inspector_id, 
            job_id,
            property_id,
            barcode,
            notes,
            image_url,
            data,
            location 
        } = req.body;

        // Create the inspection
        const inspection = equipmentInspectionRepository.create({
            equipment_id,
            inspector_id,
            job_id,
            property_id,
            barcode,
            notes,
            image_url,
            data,
            location: location ? {
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
            } as Point : undefined
        });

        await equipmentInspectionRepository.save(inspection);

        // If this is part of a job, update the job equipment status
        if (job_id) {
            await inspectionJobEquipmentRepository.update(
                { job_id, equipment_id },
                { 
                    inspection_id: inspection.inspection_id,
                    status: 'completed'
                }
            );
        }

        // Fetch complete inspection with relations
        const completeInspection = await equipmentInspectionRepository.findOne({
            where: { inspectionId: inspection.inspection_id },
            relations: ['equipment', 'inspector', 'job', 'property']
        });

        return res.status(201).json(completeInspection);
    } catch (error) {
        logger.error('Error creating equipment inspection:', error);
        return res.status(500).json({ 
            message: 'Failed to create equipment inspection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update equipment inspection
export async function updateEquipmentInspection(req: Request, res: Response) {
    try {
        const inspectionId = req.params.id;
        const {
            barcode,
            notes,
            image_url,
            data,
            location
        } = req.body;

        const inspection = await equipmentInspectionRepository.findOne({
            where: { inspection_id: inspectionId },
            relations: ['equipment', 'inspector', 'job', 'property']
        });

        if (!inspection) {
            return res.status(404).json({ message: 'Equipment inspection not found' });
        }

        // Update fields
        if (barcode !== undefined) inspection.barcode = barcode;
        if (notes !== undefined) inspection.notes = notes;
        if (image_url !== undefined) inspection.image_url = image_url;
        if (data !== undefined) inspection.data = data;
        if (location) {
            inspection.location = {
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
            } as Point;
        }

        await equipmentInspectionRepository.save(inspection);

        // Fetch updated inspection
        const updatedInspection = await equipmentInspectionRepository.findOne({
            where: { inspection_id: inspectionId },
            relations: ['equipment', 'inspector', 'job', 'property']
        });

        return res.json(updatedInspection);
    } catch (error) {
        logger.error('Error updating equipment inspection:', error);
        return res.status(500).json({ 
            message: 'Failed to update equipment inspection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Delete equipment inspection
export async function deleteEquipmentInspection(req: Request, res: Response) {
    try {
        const inspectionId = req.params.id;

        const inspection = await equipmentInspectionRepository.findOne({
            where: { inspectionId },
            relations: ['job']
        });

        if (!inspection) {
            return res.status(404).json({ message: 'Equipment inspection not found' });
        }

        // If this is part of a job, update the job equipment status
        if (inspection.job_id) {
            await inspectionJobEquipmentRepository.update(
                { 
                    job_id: inspection.job_id,
                    equipment_id: inspection.equipment_id
                },
                { 
                    inspection_id: null,
                    status: 'pending'
                }
            );
        }

        await equipmentInspectionRepository.remove(inspection);

        return res.json({ message: 'Equipment inspection deleted successfully' });
    } catch (error) {
        logger.error('Error deleting equipment inspection:', error);
        return res.status(500).json({ 
            message: 'Failed to delete equipment inspection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
