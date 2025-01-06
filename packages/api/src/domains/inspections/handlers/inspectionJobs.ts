import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { InspectionJob } from '../entities/InspectionJob';
import { InspectionJobEquipment } from '../entities/InspectionJobEquipment';
import { Equipment } from '../../equipment/entities/Equipment';
import { logger } from '../../../utils/logger';
import { In, Not } from 'typeorm';

const inspectionJobRepository = AppDataSource.getRepository(InspectionJob);
const inspectionJobEquipmentRepository = AppDataSource.getRepository(InspectionJobEquipment);
const equipmentRepository = AppDataSource.getRepository(Equipment);

// Get all inspection jobs
export async function getInspectionJobs(req: Request, res: Response) {
    try {
        const { status, property_id, technician_id } = req.query;
        const queryBuilder = inspectionJobRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.property', 'property')
            .leftJoinAndSelect('job.technician', 'technician')
            .leftJoinAndSelect('job.equipment', 'equipment')
            .leftJoinAndSelect('equipment.equipment', 'equipment');

        if (status) {
            queryBuilder.andWhere('job.status = :status', { status });
        }
        if (property_id) {
            queryBuilder.andWhere('job.property_id = :propertyId', { propertyId: property_id });
        }
        if (technician_id) {
            queryBuilder.andWhere('job.technician_id = :technicianId', { technicianId: technician_id });
        }

        const [jobs, total] = await queryBuilder.getManyAndCount();
        return res.json({ jobs, total });
    } catch (error) {
        logger.error('Error getting inspection jobs:', error);
        return res.status(500).json({ 
            message: 'Failed to get inspection jobs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Get inspection job by ID
export async function getInspectionJob(req: Request, res: Response) {
    try {
        const job = await inspectionJobRepository.findOne({
            where: { id: req.params.id },
            relations: ['property', 'technician', 'equipment', 'equipment.equipment']
        });

        if (!job) {
            return res.status(404).json({ message: 'Inspection job not found' });
        }

        return res.json(job);
    } catch (error) {
        logger.error('Error getting inspection job:', error);
        return res.status(500).json({ 
            message: 'Failed to get inspection job',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Create new inspection job
export async function createInspectionJob(req: Request, res: Response) {
    try {
        const { property_id, technician_id, scheduled_date, equipment_ids } = req.body;

        // Create the inspection job
        const job = inspectionJobRepository.create({
            property_id,
            technician_id,
            scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
            status: 'pending'
        });

        await inspectionJobRepository.save(job);

        // Add equipment to the job
        if (equipment_ids && Array.isArray(equipment_ids)) {
            const equipment = await equipmentRepository.find({
                where: { equipment_id: In(equipment_ids) }
            });

            const jobEquipment = equipment.map((eq, index) => 
                inspectionJobEquipmentRepository.create({
                    job_id: job.id,
                    equipment_id: eq.equipment_id,
                    sequence_number: index + 1,
                    status: 'pending'
                })
            );

            await inspectionJobEquipmentRepository.save(jobEquipment);
        }

        // Fetch the complete job with relations
        const completeJob = await inspectionJobRepository.findOne({
            where: { id: job.id },
            relations: ['property', 'technician', 'equipment', 'equipment.equipment']
        });

        return res.status(201).json(completeJob);
    } catch (error) {
        logger.error('Error creating inspection job:', error);
        return res.status(500).json({ 
            message: 'Failed to create inspection job',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update inspection job
export async function updateInspectionJob(req: Request, res: Response) {
    try {
        const jobId = req.params.id;
        const { status, scheduled_date, equipment_ids } = req.body;

        const job = await inspectionJobRepository.findOne({
            where: { id: jobId },
            relations: ['equipment']
        });

        if (!job) {
            return res.status(404).json({ message: 'Inspection job not found' });
        }

        // Update basic job info
        if (status) job.status = status;
        if (scheduled_date) job.scheduled_date = new Date(scheduled_date);

        await inspectionJobRepository.save(job);

        // Update equipment if provided
        if (equipment_ids && Array.isArray(equipment_ids)) {
            // Remove existing equipment not in the new list
            await inspectionJobEquipmentRepository.delete({
                job_id: jobId,
                equipment_id: Not(In(equipment_ids))
            });

            // Get existing equipment
            const existingEquipment = await inspectionJobEquipmentRepository.find({
                where: { job_id: jobId }
            });
            const existingIds = existingEquipment.map(e => e.equipment_id);

            // Add new equipment
            const newIds = equipment_ids.filter(id => !existingIds.includes(id));
            if (newIds.length > 0) {
                const newEquipment = newIds.map((id, index) => 
                    inspectionJobEquipmentRepository.create({
                        job_id: jobId,
                        equipment_id: id,
                        sequence_number: existingEquipment.length + index + 1,
                        status: 'pending'
                    })
                );
                await inspectionJobEquipmentRepository.save(newEquipment);
            }
        }

        // Fetch updated job
        const updatedJob = await inspectionJobRepository.findOne({
            where: { id: jobId },
            relations: ['property', 'technician', 'equipment', 'equipment.equipment']
        });

        return res.json(updatedJob);
    } catch (error) {
        logger.error('Error updating inspection job:', error);
        return res.status(500).json({ 
            message: 'Failed to update inspection job',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Delete inspection job
export async function deleteInspectionJob(req: Request, res: Response) {
    try {
        const jobId = req.params.id;

        const job = await inspectionJobRepository.findOne({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({ message: 'Inspection job not found' });
        }

        // Delete related equipment first
        await inspectionJobEquipmentRepository.delete({ job_id: jobId });

        // Delete the job
        await inspectionJobRepository.remove(job);

        return res.json({ message: 'Inspection job deleted successfully' });
    } catch (error) {
        logger.error('Error deleting inspection job:', error);
        return res.status(500).json({ 
            message: 'Failed to delete inspection job',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
