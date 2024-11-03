import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Sensor } from './entities/Sensor';
import { logger } from '../../utils/logger';

const sensorRepository = AppDataSource.getRepository(Sensor);

// Get all sensors
export async function getSensors(req: Request, res: Response) {
    try {
        const { active } = req.query;
        const queryBuilder = sensorRepository.createQueryBuilder('sensor');

        if (active !== undefined) {
            queryBuilder.andWhere('sensor.isActive = :active', { active: active === 'true' });
        }

        const [sensors, total] = await queryBuilder.getManyAndCount();
        return res.json({ sensors, total });
    } catch (error) {
        logger.error('Error getting sensors:', error);
        return res.status(500).json({ 
            message: 'Failed to get sensors',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Get sensor by ID
export async function getSensor(req: Request, res: Response) {
    try {
        const sensor = await sensorRepository.findOne({
            where: { id: req.params.id }
        });

        if (!sensor) {
            return res.status(404).json({ message: 'Sensor not found' });
        }

        return res.json(sensor);
    } catch (error) {
        logger.error('Error getting sensor:', error);
        return res.status(500).json({ 
            message: 'Failed to get sensor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Create new sensor
export async function createSensor(req: Request, res: Response) {
    try {
        // Validate required fields
        const { name } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Sensor name is required'
            });
        }

        const sensor = sensorRepository.create(req.body);
        const savedSensor = await sensorRepository.save(sensor);
        logger.info('Sensor created:', savedSensor);

        return res.status(201).json(savedSensor);
    } catch (error) {
        logger.error('Error creating sensor:', error);
        return res.status(500).json({ 
            message: 'Failed to create sensor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update sensor
export async function updateSensor(req: Request, res: Response) {
    try {
        const sensor = await sensorRepository.findOne({
            where: { id: req.params.id }
        });

        if (!sensor) {
            return res.status(404).json({ message: 'Sensor not found' });
        }

        // Validate name if being updated
        const { name } = req.body;
        if (name !== undefined && !name.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Sensor name cannot be empty'
            });
        }

        sensorRepository.merge(sensor, req.body);
        const updatedSensor = await sensorRepository.save(sensor);
        logger.info('Sensor updated:', updatedSensor);

        return res.json(updatedSensor);
    } catch (error) {
        logger.error('Error updating sensor:', error);
        return res.status(500).json({ 
            message: 'Failed to update sensor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Archive sensor
export async function archiveSensor(req: Request, res: Response) {
    try {
        const sensor = await sensorRepository.findOne({
            where: { id: req.params.id }
        });

        if (!sensor) {
            return res.status(404).json({ message: 'Sensor not found' });
        }

        sensor.isActive = false;
        const archivedSensor = await sensorRepository.save(sensor);
        logger.info('Sensor archived:', archivedSensor);

        return res.json({ success: true });
    } catch (error) {
        logger.error('Error archiving sensor:', error);
        return res.status(500).json({ 
            message: 'Failed to archive sensor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
