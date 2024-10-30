import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('properties_accounts')
export class PropertiesAccounts {
    @PrimaryColumn({ name: 'property_id' })
    propertyId: string;

    @PrimaryColumn({ name: 'account_id' })
    accountId: string;

    @Column()
    role: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
