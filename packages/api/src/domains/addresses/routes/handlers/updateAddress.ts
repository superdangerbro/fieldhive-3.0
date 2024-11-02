import { Request, Response } from 'express';
import { AddressService } from '../../services/addressService';
import { logger } from '../../../../core/utils/logger';

const addressService = new AddressService();

export async function updateAddress(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const address = await addressService.update(id, req.body);

        if (!address) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Address not found'
            });
        }

        res.json(address);
    } catch (error) {
        logger.error('Error updating address:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update address',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
