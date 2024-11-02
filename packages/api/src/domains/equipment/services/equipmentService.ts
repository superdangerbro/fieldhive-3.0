import { AppDataSource } from '../../../core/config/database';
import { Equipment } from '../entities/Equipment';
import { CreateEquipmentDto, UpdateEquipmentDto } from '../types';
import { logger } from '../../../core/utils/logger';

export class EquipmentService {
    private equipmentRepository = AppDataSource.getRepository(Equipment);

    async findById(id: string): Promise<Equipment | null> {
        try {
            return await this.equipmentRepository.findOne({
                where: { id }
            });
        } catch (error) {
            logger.error('Error finding equipment by ID:', error);
            throw error;
        }
    }

    async create(equipmentData: CreateEquipmentDto): Promise<Equipment> {
        try {
            const equipment = this.equipmentRepository.create(equipmentData);
            return await this.equipmentRepository.save(equipment);
        } catch (error) {
            logger.error('Error creating equipment:', error);
            throw error;
        }
    }

    async update(id: string, equipmentData: UpdateEquipmentDto): Promise<Equipment | null> {
        try {
            const equipment = await this.findById(id);
            if (!equipment) {
                return null;
            }

            this.equipmentRepository.merge(equipment, equipmentData);
            return await this.equipmentRepository.save(equipment);
        } catch (error) {
            logger.error('Error updating equipment:', error);
            throw error;
        }
    }

    async archive(id: string): Promise<Equipment | null> {
        try {
            const equipment = await this.findById(id);
            if (!equipment) {
                return null;
            }

            equipment.status = 'inactive'; // or any other logic for archiving
            return await this.equipmentRepository.save(equipment);
        } catch (error) {
            logger.error('Error archiving equipment:', error);
            throw error;
        }
    }

    private validateEquipment(equipment: Partial<CreateEquipmentDto>): void {
        const errors: string[] = [];

        if (!equipment.name?.trim()) {
            errors.push('Equipment name is required');
        }

        if (errors.length > 0) {
            throw new Error(`Equipment validation failed: ${errors.join(', ')}`);
        }
    }
}
