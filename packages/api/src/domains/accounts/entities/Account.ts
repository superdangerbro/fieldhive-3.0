import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Property } from '../../properties/entities/Property';
import { Address } from '../../addresses/entities/Address';

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn('uuid', { name: 'account_id' })
    account_id: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    type: string;

    @Column({ type: 'text' })
    status: string;

    @Column({ name: 'billing_address_id', nullable: true })
    billing_address_id: string | null;

    @ManyToOne(() => Address, { nullable: true })
    @JoinColumn({ name: 'billing_address_id' })
    billingAddress: Address | null;

    @ManyToMany(() => Property)
    @JoinTable({
        name: 'properties_accounts',
        joinColumn: {
            name: 'account_id',
            referencedColumnName: 'account_id'
        },
        inverseJoinColumn: {
            name: 'property_id',
            referencedColumnName: 'property_id'
        }
    })
    properties: Property[];

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
