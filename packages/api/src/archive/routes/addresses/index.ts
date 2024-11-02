import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Address } from '../../entities/Address';
import { logger } from '../../utils/logger';

const router = Router();

// Get address by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`Getting address with ID: ${id}`);

        const addressRepository = AppDataSource.getRepository(Address);
        const address = await addressRepository.findOne({
            where: { address_id: id }
        });

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
});

// Create address
router.post('/', async (req, res) => {
    try {
        const addressRepository = AppDataSource.getRepository(Address);
        const address = addressRepository.create(req.body);
        const result = await addressRepository.save(address);
        res.json(result);
    } catch (error) {
        logger.error('Error creating address:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create address',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Update address
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const addressRepository = AppDataSource.getRepository(Address);
        
        const address = await addressRepository.findOne({
            where: { address_id: id }
        });

        if (!address) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Address not found'
            });
        }

        addressRepository.merge(address, req.body);
        const result = await addressRepository.save(address);
        res.json(result);
    } catch (error) {
        logger.error('Error updating address:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update address',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;
