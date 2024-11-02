import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Address } from '../../addresses/entities/Address';
import { Account } from '../../accounts/entities/Account';
import { PropertyType, PropertyStatus } from '../types';

@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn('uuid', { name: 'property_id' })
    id: string;

    @Column()
    name: string;

    @Column({ type: 'varchar' })
    type: PropertyType;

    @Column({ type: 'varchar', default: 'Active' })
    status: PropertyStatus;

    @Column({ name: 'service_address_id', nullable: true })
    service_address_id: string | null;

    @ManyToOne(() => Address, { nullable: true })
    @JoinColumn({ name: 'service_address_id' })
    serviceAddress: Address | null;

    @ManyToMany(() => Account, account => account.properties)
    @JoinTable({
        name: 'properties_accounts',
        joinColumn: {
            name: 'property_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'account_id',
            referencedColumnName: 'id'
        }
    })
    accounts: Account[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
