import { Request, Response } from 'express';
import { SensorService } from '../../services/sensorService';
import { logger } from '../../../../core/utils/logger';

const sensorService = new SensorService();

export async function archiveSensor(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Archiving sensor with ID: ${id}`);

        const sensor = await sensorService.archive(id);

        if (!sensor) {
            logger.warn(`Sensor not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Sensor not found'
            });
        }

        logger.info('Sensor archived successfully:', sensor);
        res.json(sensor);
    } catch (error) {
        logger.error('Error archiving sensor:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive sensor',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
