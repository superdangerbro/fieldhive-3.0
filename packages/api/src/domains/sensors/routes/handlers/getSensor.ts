import { Request, Response } from 'express';
import { SensorService } from '../../services/sensorService';
import { logger } from '../../../../core/utils/logger';

const sensorService = new SensorService();

export async function getSensor(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting sensor with ID: ${id}`);

        const sensor = await sensorService.findById(id);

        if (!sensor) {
            logger.warn(`Sensor not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Sensor not found'
            });
        }

        logger.info(`Found sensor:`, sensor);
        res.json(sensor);
    } catch (error) {
        logger.error('Error fetching sensor:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch sensor',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
