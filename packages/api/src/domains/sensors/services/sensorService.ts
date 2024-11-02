import { AppDataSource } from '../../../core/config/database';
import { Sensor } from '../entities/Sensor';
import { CreateSensorDto, UpdateSensorDto } from '../types';
import { logger } from '../../../core/utils/logger';

export class SensorService {
    private sensorRepository = AppDataSource.getRepository(Sensor);

    async findById(id: string): Promise<Sensor | null> {
        try {
            return await this.sensorRepository.findOne({
                where: { id }
            });
        } catch (error) {
            logger.error('Error finding sensor by ID:', error);
            throw error;
        }
    }

    async create(sensorData: CreateSensorDto): Promise<Sensor> {
        try {
            const sensor = this.sensorRepository.create(sensorData);
            return await this.sensorRepository.save(sensor);
        } catch (error) {
            logger.error('Error creating sensor:', error);
            throw error;
        }
    }

    async update(id: string, sensorData: UpdateSensorDto): Promise<Sensor | null> {
        try {
            const sensor = await this.findById(id);
            if (!sensor) {
                return null;
            }

            this.sensorRepository.merge(sensor, sensorData);
            return await this.sensorRepository.save(sensor);
        } catch (error) {
            logger.error('Error updating sensor:', error);
            throw error;
        }
    }

    async archive(id: string): Promise<Sensor | null> {
        try {
            const sensor = await this.findById(id);
            if (!sensor) {
                return null;
            }

            sensor.isActive = false; // or any other logic for archiving
            return await this.sensorRepository.save(sensor);
        } catch (error) {
            logger.error('Error archiving sensor:', error);
            throw error;
        }
    }

    private validateSensor(sensor: Partial<CreateSensorDto>): void {
        const errors: string[] = [];

        if (!sensor.name?.trim()) {
            errors.push('Sensor name is required');
        }

        if (errors.length > 0) {
            throw new Error(`Sensor validation failed: ${errors.join(', ')}`);
        }
    }
}
