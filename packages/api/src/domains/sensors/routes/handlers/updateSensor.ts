import { Request, Response } from 'express';
import { SensorService } from '../../services/sensorService';
import { UpdateSensorDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const sensorService = new SensorService();

export async function updateSensor(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const sensorData: UpdateSensorDto = req.body;
        logger.info(`Updating sensor ${id}:`, sensorData);

        const sensor = await sensorService.update(id, sensorData);

        if (!sensor) {
            logger.warn(`Sensor not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Sensor not found'
            });
        }

        logger.info('Sensor updated successfully:', sensor);
        res.json(sensor);
    } catch (error) {
        logger.error('Error updating sensor:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update sensor',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
