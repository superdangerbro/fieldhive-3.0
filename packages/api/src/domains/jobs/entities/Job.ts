import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Property } from '../../properties/entities/Property';
import { Address } from '../../addresses/entities/Address';

@Entity('jobs')
export class Job {
    @PrimaryGeneratedColumn('uuid', { name: 'job_id' })
    job_id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'property_id' })
    property_id: string;

    @ManyToOne(() => Property)
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @Column({ name: 'job_type_id', type: 'text' })
    job_type_id: string;

    @Column({ 
        type: 'text',
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    })
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';

    @Column({ name: 'use_custom_addresses', default: false })
    use_custom_addresses: boolean;

    @Column({ name: 'service_address_id', nullable: true })
    service_address_id: string | null;

    @ManyToOne(() => Address)
    @JoinColumn({ name: 'service_address_id' })
    service_address: Address;

    @Column({ name: 'billing_address_id', nullable: true })
    billing_address_id: string | null;

    @ManyToOne(() => Address)
    @JoinColumn({ name: 'billing_address_id' })
    billing_address: Address;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
