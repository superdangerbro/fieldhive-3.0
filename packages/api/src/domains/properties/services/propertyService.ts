import { AppDataSource } from '../../../core/config/database';
import { Property } from '../entities/Property';
import { CreatePropertyDto, UpdatePropertyDto, PropertyFilters, PropertyStatus } from '../types';
import { AddressService } from '../../addresses/services/addressService';
import { AccountService } from '../../accounts/services/accountService';
import { logger } from '../../../core/utils/logger';

export class PropertyService {
    private propertyRepository = AppDataSource.getRepository(Property);
    private addressService = new AddressService();
    private accountService = new AccountService();

    async findById(id: string): Promise<Property | null> {
        try {
            return await this.propertyRepository.findOne({
                where: { id },
                relations: ['serviceAddress', 'accounts']
            });
        } catch (error) {
            logger.error('Error finding property by ID:', error);
            throw error;
        }
    }

    async create(propertyData: CreatePropertyDto): Promise<Property> {
        try {
            this.validateProperty(propertyData);
            
            const property = this.propertyRepository.create({
                ...propertyData,
                status: propertyData.status || 'Active'
            });

            if (propertyData.account_ids?.length) {
                property.accounts = [];
                for (const accountId of propertyData.account_ids) {
                    const account = await this.accountService.findById(accountId);
                    if (!account) {
                        throw new Error(`Account not found with ID: ${accountId}`);
                    }
                    property.accounts.push(account);
                }
            }

            return await this.propertyRepository.save(property);
        } catch (error) {
            logger.error('Error creating property:', error);
            throw error;
        }
    }

    async update(id: string, propertyData: UpdatePropertyDto): Promise<Property | null> {
        try {
            const property = await this.findById(id);
            if (!property) {
                return null;
            }

            this.validateProperty(propertyData, true);
            this.propertyRepository.merge(property, propertyData);
            return await this.propertyRepository.save(property);
        } catch (error) {
            logger.error('Error updating property:', error);
            throw error;
        }
    }

    async archive(id: string): Promise<Property | null> {
        try {
            const property = await this.findById(id);
            if (!property) {
                return null;
            }

            property.status = 'Archived';
            return await this.propertyRepository.save(property);
        } catch (error) {
            logger.error('Error archiving property:', error);
            throw error;
        }
    }

    private validateProperty(property: Partial<CreatePropertyDto>, isUpdate = false): void {
        const errors: string[] = [];

        if (!isUpdate || property.name !== undefined) {
            if (!property.name?.trim()) {
                errors.push('Property name is required');
            }
        }

        if (!isUpdate || property.type !== undefined) {
            if (!property.type) {
                errors.push('Property type is required');
            }
        }

        if (errors.length > 0) {
            throw new Error(`Property validation failed: ${errors.join(', ')}`);
        }
    }
}
