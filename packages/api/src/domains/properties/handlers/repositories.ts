import { AppDataSource } from '../../../config/database';
import { Property } from '../entities/Property';
import { Account } from '../../accounts/entities/Account';
import { Address } from '../../addresses/entities/Address';

export const repositories = {
    propertyRepository: AppDataSource.getRepository(Property),
    accountRepository: AppDataSource.getRepository(Account),
    addressRepository: AppDataSource.getRepository(Address)
};
