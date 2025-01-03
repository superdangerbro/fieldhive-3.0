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
    data?: {
        floor?: string;
        is_interior?: boolean;
    };
    barcode?: string;
    photo_url?: string;
}

interface UpdateEquipmentBody {
    job_id?: string;
    equipment_type_id?: string;
    location?: LocationInput | null;
    status?: string;
    is_georeferenced?: boolean;
    barcode?: string;
    photo_url?: string;
}

export class EquipmentHandler {
    // Get all equipment with optional filters
    async getEquipment(req: Request, res: Response) {
        try {
            const { type, status, bounds } = req.query;
            const queryBuilder = equipmentRepository
                .createQueryBuilder('equipment')
                .leftJoinAndSelect('equipment.job', 'job')
                .leftJoinAndSelect('job.property', 'property')
                .leftJoinAndSelect('property.serviceAddress', 'propertyServiceAddress')
                .leftJoinAndSelect('job.serviceAddress', 'jobServiceAddress');

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

            // Transform data for frontend
            const transformedEquipment = equipment.map(eq => {
                const base = eq.toJSON();
                const jobData = eq.job ? {
                    ...eq.job,
                    property: eq.job.property ? {
                        ...eq.job.property,
                        type: eq.job.property.type || '-', // Use the type column directly
                        address: eq.job.property.serviceAddress
                    } : undefined,
                    serviceAddress: eq.job.serviceAddress
                } : undefined;

                return {
                    ...base,
                    job: jobData
                };
            });

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
    async getEquipmentById(req: Request, res: Response) {
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
    async createEquipment(req: Request<any, any, CreateEquipmentBody>, res: Response) {
        try {
            // Validate required fields
            const { job_id, equipment_type_id, location, data = {} } = req.body;
            logger.info('Received equipment data:', { 
                job_id, 
                equipment_type_id, 
                location, 
                data,
                rawFloor: data?.floor,
                floorType: data?.floor !== undefined ? typeof data.floor : 'undefined'
            });

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

            // Handle floor value
            let floorValue = null;
            if (data.floor === 'G') {
                floorValue = 'G';
            } else if (data.floor !== undefined && data.floor !== null) {
                const parsed = parseInt(data.floor as string);
                floorValue = isNaN(parsed) ? data.floor : parsed;
            }

            // Create equipment instance
            const equipment = equipmentRepository.create({
                job_id,
                equipment_type_id,
                status: req.body.status || 'active',
                is_georeferenced: req.body.is_georeferenced ?? true,
                barcode: req.body.barcode || null,
                photo_url: req.body.photo_url || null,
                data: {
                    ...data,
                    floor: floorValue,
                    is_interior: data?.is_interior ?? false
                }
            });

            logger.info('Created equipment instance:', { 
                data: equipment.data,
                floor: equipment.data.floor,
                floorType: equipment.data.floor !== undefined ? typeof equipment.data.floor : 'undefined',
                barcode: equipment.barcode,
                photo_url: equipment.photo_url
            });

            // Handle location if provided
            if (location?.latitude !== undefined && location?.longitude !== undefined) {
                equipment.setLocation(location.latitude, location.longitude);
            }

            const savedEquipment = await equipmentRepository.save(equipment);
            logger.info('Saved equipment:', { 
                id: savedEquipment.equipment_id,
                data: savedEquipment.data,
                floor: savedEquipment.data.floor,
                floorType: savedEquipment.data.floor !== undefined ? typeof savedEquipment.data.floor : 'undefined',
                barcode: savedEquipment.barcode,
                photo_url: savedEquipment.photo_url
            });

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
    async updateEquipment(req: Request<any, any, UpdateEquipmentBody>, res: Response) {
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
                is_georeferenced: updateData.is_georeferenced,
                barcode: updateData.barcode,
                photo_url: updateData.photo_url
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
    async archiveEquipment(req: Request, res: Response) {
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

    // Delete equipment
    async deleteEquipment(req: Request, res: Response) {
        try {
            const equipment = await equipmentRepository.findOne({ 
                where: { equipment_id: req.params.id } 
            });

            if (!equipment) {
                return res.status(404).json({ message: 'Equipment not found' });
            }

            await equipmentRepository.remove(equipment);
            logger.info('Equipment deleted:', { id: req.params.id });

            return res.json({ success: true, message: 'Equipment deleted successfully' });
        } catch (error) {
            logger.error('Error deleting equipment:', error);
            return res.status(500).json({ 
                message: 'Failed to delete equipment',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export const equipmentHandler = new EquipmentHandler();
