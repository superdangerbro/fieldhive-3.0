import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany
} from 'typeorm';
import type { AccountStatus } from '@fieldhive/shared';
import { Property } from './Property';

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'is_company', default: false })
    isCompany: boolean;

    @Column({
        type: 'text',
        default: 'active'
    })
    status: AccountStatus;

    @Column('jsonb', { name: 'billing_address' })
    billingAddress: {
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    };

    @ManyToMany(() => Property, property => property.accounts)
    properties: Property[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
