import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Property } from './Property';
import { Address } from './Address';

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn('uuid', { name: 'account_id' })
    id: string;

    @Column()
    name: string;

    @Column({ type: 'varchar' })
    type: string;

    @Column({ type: 'varchar', default: 'Active' })
    status: string;

    @ManyToOne(() => Address, { nullable: true })
    @JoinColumn({ name: 'billing_address_id' })
    billingAddress: Address | null;

    @OneToMany(() => Property, property => property.account)
    properties: Property[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
