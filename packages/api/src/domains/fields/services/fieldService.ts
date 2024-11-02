import { AppDataSource } from '../../../core/config/database';
import { Field } from '../entities/Field';
import { CreateFieldDto, UpdateFieldDto } from '../types';
import { logger } from '../../../core/utils/logger';

export class FieldService {
    private fieldRepository = AppDataSource.getRepository(Field);

    async findById(id: string): Promise<Field | null> {
        try {
            return await this.fieldRepository.findOne({
                where: { id }
            });
        } catch (error) {
            logger.error('Error finding field by ID:', error);
            throw error;
        }
    }

    async create(fieldData: CreateFieldDto): Promise<Field> {
        try {
            const field = this.fieldRepository.create(fieldData);
            return await this.fieldRepository.save(field);
        } catch (error) {
            logger.error('Error creating field:', error);
            throw error;
        }
    }

    async update(id: string, fieldData: UpdateFieldDto): Promise<Field | null> {
        try {
            const field = await this.findById(id);
            if (!field) {
                return null;
            }

            this.fieldRepository.merge(field, fieldData);
            return await this.fieldRepository.save(field);
        } catch (error) {
            logger.error('Error updating field:', error);
            throw error;
        }
    }

    async archive(id: string): Promise<Field | null> {
        try {
            const field = await this.findById(id);
            if (!field) {
                return null;
            }

            field.isActive = false; // or any other logic for archiving
            return await this.fieldRepository.save(field);
        } catch (error) {
            logger.error('Error archiving field:', error);
            throw error;
        }
    }

    private validateField(field: Partial<CreateFieldDto>): void {
        const errors: string[] = [];

        if (!field.name?.trim()) {
            errors.push('Field name is required');
        }

        if (errors.length > 0) {
            throw new Error(`Field validation failed: ${errors.join(', ')}`);
        }
    }
}
