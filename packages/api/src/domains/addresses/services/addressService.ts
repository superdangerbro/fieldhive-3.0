import { AppDataSource } from '../../../config/database';
import { Address } from '../entities/Address';
import { CreateAddressDto, UpdateAddressDto, AddressFilters } from '../types';
import { logger } from '../../../utils/logger';

export class AddressService {
    private addressRepository = AppDataSource.getRepository(Address);

    async findById(id: string): Promise<Address | null> {
        try {
            return await this.addressRepository.findOne({
                where: { address_id: id }
            });
        } catch (error) {
            logger.error('Error finding address by ID:', error);
            throw error;
        }
    }

    async create(addressData: CreateAddressDto): Promise<Address> {
        try {
            this.validateAddress(addressData);
            const address = this.addressRepository.create(addressData);
            return await this.addressRepository.save(address);
        } catch (error) {
            logger.error('Error creating address:', error);
            throw error;
        }
    }

    async update(id: string, addressData: UpdateAddressDto): Promise<Address | null> {
        try {
            const address = await this.findById(id);
            if (!address) {
                return null;
            }

            // Only validate fields that are being updated
            this.validateAddress(addressData, true);
            
            this.addressRepository.merge(address, addressData);
            return await this.addressRepository.save(address);
        } catch (error) {
            logger.error('Error updating address:', error);
            throw error;
        }
    }

    async findByFilters(filters: AddressFilters): Promise<Address[]> {
        try {
            return await this.addressRepository.find({
                where: filters
            });
        } catch (error) {
            logger.error('Error finding addresses by filters:', error);
            throw error;
        }
    }

    private validateAddress(address: Partial<CreateAddressDto>, isUpdate = false): void {
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

        if (errors.length > 0) {
            throw new Error(`Address validation failed: ${errors.join(', ')}`);
        }
    }
}
