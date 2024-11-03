import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Address } from './entities/Address';
import { logger } from '../../utils/logger';

const addressRepository = AppDataSource.getRepository(Address);

// Get address by ID
export async function getAddress(req: Request, res: Response) {
    try {
        const address = await addressRepository.findOne({
            where: { address_id: req.params.id }
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        return res.json(address);
    } catch (error) {
        logger.error('Error getting address:', error);
        return res.status(500).json({ 
            message: 'Failed to get address',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Create new address
export async function createAddress(req: Request, res: Response) {
    try {
        // Validate required fields
        const errors = validateAddress(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: errors.join(', ')
            });
        }

        const address = addressRepository.create(req.body);
        const savedAddress = await addressRepository.save(address);
        logger.info('Address created:', savedAddress);

        return res.status(201).json(savedAddress);
    } catch (error) {
        logger.error('Error creating address:', error);
        return res.status(500).json({ 
            message: 'Failed to create address',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update address
export async function updateAddress(req: Request, res: Response) {
    try {
        const address = await addressRepository.findOne({
            where: { address_id: req.params.id }
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Validate fields that are being updated
        const errors = validateAddress(req.body, true);
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: errors.join(', ')
            });
        }

        addressRepository.merge(address, req.body);
        const updatedAddress = await addressRepository.save(address);
        logger.info('Address updated:', updatedAddress);

        return res.json(updatedAddress);
    } catch (error) {
        logger.error('Error updating address:', error);
        return res.status(500).json({ 
            message: 'Failed to update address',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Get addresses by filters
export async function getAddresses(req: Request, res: Response) {
    try {
        const { city, province, country } = req.query;
        const queryBuilder = addressRepository.createQueryBuilder('address');

        if (city) {
            queryBuilder.andWhere('address.city = :city', { city });
        }
        if (province) {
            queryBuilder.andWhere('address.province = :province', { province });
        }
        if (country) {
            queryBuilder.andWhere('address.country = :country', { country });
        }

        const [addresses, total] = await queryBuilder.getManyAndCount();
        return res.json({ addresses, total });
    } catch (error) {
        logger.error('Error getting addresses:', error);
        return res.status(500).json({ 
            message: 'Failed to get addresses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Helper function to validate address fields
function validateAddress(address: any, isUpdate = false): string[] {
    const errors: string[] = [];

    if (!isUpdate || address.address1 !== undefined) {
        if (!address.address1?.trim()) {
            errors.push('Address line 1 is required');
        }
    }

    if (!isUpdate || address.city !== undefined) {
        if (!address.city?.trim()) {
            errors.push('City is required');
        }
    }

    if (!isUpdate || address.province !== undefined) {
        if (!address.province?.trim()) {
            errors.push('Province is required');
        }
    }

    if (!isUpdate || address.postal_code !== undefined) {
        if (!address.postal_code?.trim()) {
            errors.push('Postal code is required');
        }
    }

    if (!isUpdate || address.country !== undefined) {
        if (!address.country?.trim()) {
            errors.push('Country is required');
        }
    }

    return errors;
}
