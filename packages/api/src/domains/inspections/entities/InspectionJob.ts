import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Property } from '../../properties/entities/Property';
import { User } from '../../users/entities/User';
import { InspectionJobEquipment } from './InspectionJobEquipment';

@Entity('inspection_jobs')
export class InspectionJob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'property_id' })
    property_id: string;

    @Column({ name: 'technician_id' })
    technician_id: string;

    @Column({ type: 'timestamptz', name: 'scheduled_date', nullable: true })
    scheduled_date?: Date;

    @Column({ 
        type: 'text',
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    })
    status: 'pending' | 'in_progress' | 'completed';

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updated_at: Date;

    // Relationships
    @ManyToOne(() => Property)
    @JoinColumn({ name: 'property_id', referencedColumnName: 'property_id' })
    property: Property;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'technician_id', referencedColumnName: 'user_id' })
    technician: User;

    @OneToMany(() => InspectionJobEquipment, equipment => equipment.job)
    equipment: InspectionJobEquipment[];
}
