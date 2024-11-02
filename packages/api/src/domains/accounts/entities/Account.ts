import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Property } from '../../properties/entities/Property';
import { Address } from '../../addresses/entities/Address';
import { AccountType, AccountStatus } from '../types';

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn('uuid', { name: 'account_id' })
    id: string;

    @Column()
    name: string;

    @Column({ type: 'varchar' })
    type: AccountType;

    @Column({ type: 'varchar', default: 'Active' })
    status: AccountStatus;

    @Column({ name: 'billing_address_id', nullable: true })
    billing_address_id: string | null;

    @ManyToOne(() => Address, { nullable: true })
    @JoinColumn({ name: 'billing_address_id' })
    billingAddress: Address | null;

    @ManyToMany(() => Property, (property: Property) => property.accounts)
    properties: Property[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
