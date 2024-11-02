import { AppDataSource } from '../../../config/database';
import { Account } from '../entities/Account';
import { CreateAccountDto, UpdateAccountDto, AccountFilters, AccountStatus } from '../types';
import { AddressService } from '../../addresses/services/addressService';
import { logger } from '../../../utils/logger';

export class AccountService {
    private accountRepository = AppDataSource.getRepository(Account);
    private addressService = new AddressService();

    async findById(id: string): Promise<Account | null> {
        try {
            return await this.accountRepository.findOne({
                where: { account_id: id },
                relations: ['billingAddress', 'properties']
            });
        } catch (error) {
            logger.error('Error finding account by ID:', error);
            throw error;
        }
    }

    async findByFilters(filters: AccountFilters & { limit?: number; offset?: number }): Promise<{ accounts: Account[]; total: number }> {
        try {
            const query = this.accountRepository.createQueryBuilder('account')
                .leftJoinAndSelect('account.billingAddress', 'billingAddress')
                .leftJoinAndSelect('account.properties', 'properties');

            if (filters.type) {
                query.andWhere('account.type = :type', { type: filters.type });
            }

            if (filters.status) {
                query.andWhere('account.status = :status', { status: filters.status });
            }

            if (filters.name) {
                query.andWhere('account.name ILIKE :name', { name: `%${filters.name}%` });
            }

            // Get total count before applying pagination
            const total = await query.getCount();

            // Apply pagination if provided
            if (filters.limit !== undefined) {
                query.take(filters.limit);
            }
            if (filters.offset !== undefined) {
                query.skip(filters.offset);
            }

            const accounts = await query.getMany();

            // Transform the response to match frontend expectations
            const transformedAccounts = accounts.map(account => ({
                ...account,
                billing_address: account.billingAddress
            }));

            return {
                accounts: transformedAccounts,
                total
            };
        } catch (error) {
            logger.error('Error finding accounts by filters:', error);
            throw error;
        }
    }

    async create(accountData: CreateAccountDto): Promise<Account> {
        try {
            this.validateAccount(accountData);
            
            // Create account with initial status
            const account = this.accountRepository.create({
                ...accountData,
                status: accountData.status || 'Active'
            });

            return await this.accountRepository.save(account);
        } catch (error) {
            logger.error('Error creating account:', error);
            throw error;
        }
    }

    async update(id: string, accountData: UpdateAccountDto): Promise<Account | null> {
        try {
            const account = await this.findById(id);
            if (!account) {
                return null;
            }

            // Only validate fields that are being updated
            this.validateAccount(accountData, true);
            
            this.accountRepository.merge(account, accountData);
            return await this.accountRepository.save(account);
        } catch (error) {
            logger.error('Error updating account:', error);
            throw error;
        }
    }

    async archive(id: string): Promise<Account | null> {
        try {
            const account = await this.findById(id);
            if (!account) {
                return null;
            }

            account.status = 'Archived';
            return await this.accountRepository.save(account);
        } catch (error) {
            logger.error('Error archiving account:', error);
            throw error;
        }
    }

    async updateBillingAddress(id: string, addressId: string): Promise<Account | null> {
        try {
            const account = await this.findById(id);
            if (!account) {
                return null;
            }

            // Verify address exists
            const address = await this.addressService.findById(addressId);
            if (!address) {
                throw new Error('Address not found');
            }

            account.billing_address_id = addressId;
            return await this.accountRepository.save(account);
        } catch (error) {
            logger.error('Error updating account billing address:', error);
            throw error;
        }
    }

    private validateAccount(account: Partial<CreateAccountDto>, isUpdate = false): void {
        const errors: string[] = [];

        if (!isUpdate || account.name !== undefined) {
            if (!account.name?.trim()) {
                errors.push('Account name is required');
            }
        }

        if (!isUpdate || account.type !== undefined) {
            if (!account.type) {
                errors.push('Account type is required');
            }
        }

        if (account.status) {
            const validStatuses: AccountStatus[] = ['Active', 'Inactive', 'Archived'];
            if (!validStatuses.includes(account.status)) {
                errors.push('Invalid account status');
            }
        }

        if (errors.length > 0) {
            throw new Error(`Account validation failed: ${errors.join(', ')}`);
        }
    }
}

export const accountService = new AccountService();
