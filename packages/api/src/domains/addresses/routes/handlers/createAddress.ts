import { Request, Response } from 'express';
import { AddressService } from '../../services/addressService';
import { logger } from '../../../../core/utils/logger';

const addressService = new AddressService();

export async function createAddress(req: Request, res: Response) {
    try {
        const address = await addressService.create(req.body);
        res.json(address);
    } catch (error) {
        logger.error('Error creating address:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create address',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
