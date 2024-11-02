import { AppDataSource } from '../../../core/config/database';
import { Inspection } from '../entities/Inspection';
import { CreateInspectionDto, UpdateInspectionDto } from '../types';
import { logger } from '../../../core/utils/logger';

export class InspectionService {
    private inspectionRepository = AppDataSource.getRepository(Inspection);

    async findById(id: string): Promise<Inspection | null> {
        try {
            return await this.inspectionRepository.findOne({
                where: { id },
                relations: ['property']
            });
        } catch (error) {
            logger.error('Error finding inspection by ID:', error);
            throw error;
        }
    }

    async create(inspectionData: CreateInspectionDto): Promise<Inspection> {
        try {
            this.validateInspection(inspectionData);
            const inspection = this.inspectionRepository.create({
                ...inspectionData,
                status: inspectionData.status || 'pending'
            });
            return await this.inspectionRepository.save(inspection);
        } catch (error) {
            logger.error('Error creating inspection:', error);
            throw error;
        }
    }

    async update(id: string, inspectionData: UpdateInspectionDto): Promise<Inspection | null> {
        try {
            const inspection = await this.findById(id);
            if (!inspection) {
                return null;
            }

            this.validateInspection(inspectionData, true);
            this.inspectionRepository.merge(inspection, inspectionData);
            return await this.inspectionRepository.save(inspection);
        } catch (error) {
            logger.error('Error updating inspection:', error);
            throw error;
        }
    }

    async archive(id: string): Promise<Inspection | null> {
        try {
            const inspection = await this.findById(id);
            if (!inspection) {
                return null;
            }

            inspection.status = 'cancelled';
            return await this.inspectionRepository.save(inspection);
        } catch (error) {
            logger.error('Error archiving inspection:', error);
            throw error;
        }
    }

    private validateInspection(inspection: Partial<CreateInspectionDto>, isUpdate = false): void {
        const errors: string[] = [];

        if (!isUpdate || inspection.title !== undefined) {
            if (!inspection.title?.trim()) {
                errors.push('Inspection title is required');
            }
        }

        if (!isUpdate || inspection.property_id !== undefined) {
            if (!inspection.property_id) {
                errors.push('Property ID is required');
            }
        }

        if (errors.length > 0) {
            throw new Error(`Inspection validation failed: ${errors.join(', ')}`);
        }
    }
}
