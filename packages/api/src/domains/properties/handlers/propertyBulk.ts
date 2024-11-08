import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { In } from 'typeorm';
import { logger } from '../../../utils/logger';
import { repositories } from './repositories';
import { Address } from '../../addresses/entities/Address';

// Bulk delete properties
export async function bulkDeleteProperties(req: Request, res: Response) {
    try {
        const { propertyIds } = req.body;

        if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Property IDs array is required and must not be empty'
            });
        }

        logger.info(`Bulk deleting properties:`, propertyIds);

        // Fetch all properties with their addresses
        const properties = await repositories.propertyRepository.find({
            where: { property_id: In(propertyIds) },
            relations: ['serviceAddress', 'billingAddress', 'accounts']
        });

        if (properties.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'No properties found with the provided IDs'
            });
        }

        // Start a transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Collect all addresses for deletion
            const addressesToDelete = new Set<Address>();
            for (const property of properties) {
                if (property.serviceAddress) {
                    addressesToDelete.add(property.serviceAddress);
                }
                if (property.billingAddress && property.billingAddress.address_id !== property.serviceAddress?.address_id) {
                    addressesToDelete.add(property.billingAddress);
                }

                // Remove relationships
                property.accounts = [];
                property.serviceAddress = null;
                property.billingAddress = null;
            }

            // Save properties with cleared relationships
            await queryRunner.manager.save(properties);

            // Delete all properties
            await queryRunner.manager.remove(properties);

            // Delete all associated addresses
            if (addressesToDelete.size > 0) {
                await queryRunner.manager.remove(Array.from(addressesToDelete));
            }

            // Commit transaction
            await queryRunner.commitTransaction();

            logger.info(`Successfully deleted ${properties.length} properties and their associated addresses`);
            res.json({
                success: true,
                message: `Successfully deleted ${properties.length} properties`
            });
        } catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    } catch (error) {
        logger.error('Error bulk deleting properties:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete properties',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
