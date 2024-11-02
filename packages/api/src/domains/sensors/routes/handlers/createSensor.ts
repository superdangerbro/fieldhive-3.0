import { Request, Response } from 'express';
import { SensorService } from '../../services/sensorService';
import { CreateSensorDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const sensorService = new SensorService();

export async function createSensor(req: Request, res: Response) {
    try {
        const sensorData: CreateSensorDto = req.body;
        logger.info('Creating new sensor:', sensorData);

        const sensor = await sensorService.create(sensorData);
        
        logger.info('Sensor created successfully:', sensor);
        res.status(201).json(sensor);
    } catch (error) {
        logger.error('Error creating sensor:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create sensor',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
