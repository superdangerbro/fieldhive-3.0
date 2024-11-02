import { Request, Response } from 'express';
import { AddressService } from '../../services/addressService';
import { logger } from '../../../../core/utils/logger';

const addressService = new AddressService();

export async function getAddress(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting address with ID: ${id}`);

        const address = await addressService.findById(id);

        if (!address) {
            logger.warn(`Address not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Address not found'
            });
        }

        logger.info(`Found address:`, address);
        res.json(address);
    } catch (error) {
        logger.error('Error fetching address:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch address',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
