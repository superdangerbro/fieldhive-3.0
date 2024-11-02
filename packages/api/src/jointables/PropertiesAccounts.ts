import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Property } from '../domains/properties/entities/Property';
import { Account } from '../domains/accounts/entities/Account';

@Entity('properties_accounts')
export class PropertiesAccounts {
    @PrimaryColumn({ name: 'property_id' })
    property_id: string;

    @PrimaryColumn({ name: 'account_id' })
    account_id: string;

    @ManyToOne('Property', 'accountProperties')
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @ManyToOne('Account', 'propertyAccounts')
    @JoinColumn({ name: 'account_id' })
    account: Account;
}
