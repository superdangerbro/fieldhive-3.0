import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Address } from '../../addresses/entities/Address';
import { Account } from '../../accounts/entities/Account';

@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn('uuid', { name: 'property_id' })
    property_id: string;

    @Column()
    name: string;

    @Column({ name: 'property_type', type: 'text' })
    type: string;

    @Column({ type: 'text' })
    status: string;

    @Column({ type: 'jsonb', nullable: true })
    location: any;

    @Column({ type: 'jsonb', nullable: true })
    boundary: any;

    @Column({ name: 'service_address_id', nullable: true })
    service_address_id: string | null;

    @Column({ name: 'billing_address_id', nullable: true })
    billing_address_id: string | null;

    @ManyToOne(() => Address, { nullable: true })
    @JoinColumn({ name: 'service_address_id' })
    serviceAddress: Address | null;

    @ManyToOne(() => Address, { nullable: true })
    @JoinColumn({ name: 'billing_address_id' })
    billingAddress: Address | null;

    @ManyToMany(() => Account, account => account.properties)
    accounts: Account[];

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
