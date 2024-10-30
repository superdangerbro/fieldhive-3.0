import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Property } from './Property';

@Entity('jobs')
export class Job {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'property_id' })
    propertyId: string;

    @ManyToOne(() => Property)
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @Column({ 
        type: 'text',
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    })
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
