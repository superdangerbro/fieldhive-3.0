import { AppDataSource } from '../../../config/database';
import { Account } from '../entities/Account';
import { CreateAccountDto, UpdateAccountDto, AccountFilters, AccountStatus } from '../types';
import { AddressService } from '../../addresses/services/addressService';
import { logger } from '../../../utils/logger';

export class AccountService {
    private accountRepository = AppDataSource.getRepository(Account);
    private addressService = new AddressService();

    async findById(id: string): Promise<Account | null> {
        return this.accountRepository.findOne({
            where: { account_id: id },
            relations: ['billingAddress', 'properties']
        });
    }

    async findByFilters(filters: AccountFilters & { limit?: number; offset?: number; search?: string }): Promise<{ accounts: Account[]; total: number }> {
        try {
            const query = this.accountRepository
                .createQueryBuilder('account')
                .leftJoinAndSelect('account.billingAddress', 'billingAddress')
                .leftJoinAndSelect('account.properties', 'properties');

            // Add filters
            if (filters.type) {
                query.andWhere('account.type = :type', { type: filters.type });
            }
            if (filters.status) {
                query.andWhere('account.status = :status', { status: filters.status });
            }
            if (filters.search) {
                // Check if it's a UUID (account_id)
                if (filters.search.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    logger.info('Searching by account_id:', filters.search);
                    query.andWhere('account.account_id = :id', { id: filters.search });
                } else {
                    logger.info('Searching by name:', filters.search);
                    query.andWhere('account.name ILIKE :name', { name: `%${filters.search}%` });
                }
            }

            // Log the generated SQL
            const sqlQuery = query.getSql();
            const sqlParams = query.getParameters();
            logger.info('Generated SQL:', { sql: sqlQuery, params: sqlParams });

            // Get total count
            const total = await query.getCount();

            // Apply pagination
            if (filters.limit !== undefined) {
                query.take(filters.limit);
            }
            if (filters.offset !== undefined) {
                query.skip(filters.offset);
            }

            // Get accounts
            const accounts = await query
                .orderBy('account.name', 'ASC')
                .getMany();

            // Log the results
            logger.info('Query results:', {
                total,
                accountCount: accounts.length,
                firstAccount: accounts[0] ? {
                    id: accounts[0].account_id,
                    name: accounts[0].name,
                    billing_address_id: accounts[0].billing_address_id,
                    billingAddress: accounts[0].billingAddress
                } : null
            });

            return { accounts, total };
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
                status: 'Active'
            });

            await this.accountRepository.save(account);
            return this.findById(account.account_id) as Promise<Account>;
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
            
            await this.accountRepository.update(id, accountData);
            
            // Fetch and return the updated account with relations
            return this.findById(id);
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
            await this.accountRepository.save(account);
            return this.findById(id);
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

            // First verify the address exists
            const address = await this.addressService.findById(addressId);
            if (!address) {
                throw new Error('Address not found');
            }

            // Update the account
            await this.accountRepository.update(id, { billing_address_id: addressId });

            // Return the updated account with relations
            return this.findById(id);
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

        if (errors.length > 0) {
            throw new Error(`Account validation failed: ${errors.join(', ')}`);
        }
    }
}

export const accountService = new AccountService();
