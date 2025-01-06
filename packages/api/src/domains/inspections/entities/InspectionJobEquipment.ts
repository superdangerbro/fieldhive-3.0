import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { InspectionJob } from './InspectionJob';
import { Equipment } from '../../equipment/entities/Equipment';
import { EquipmentInspection } from './EquipmentInspection';

@Entity('inspection_job_equipment')
export class InspectionJobEquipment {
    @PrimaryColumn({ name: 'job_id' })
    job_id: string;

    @PrimaryColumn({ name: 'equipment_id' })
    equipment_id: string;

    @Column({ name: 'inspection_id', nullable: true })
    inspection_id?: string;

    @Column({ 
        type: 'text',
        enum: ['pending', 'completed'],
        default: 'pending'
    })
    status: 'pending' | 'completed';

    @Column({ name: 'sequence_number' })
    sequence_number: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updated_at: Date;

    // Relationships
    @ManyToOne(() => InspectionJob, job => job.equipment)
    @JoinColumn({ name: 'job_id' })
    job: InspectionJob;

    @ManyToOne(() => Equipment)
    @JoinColumn({ name: 'equipment_id', referencedColumnName: 'equipment_id' })
    equipment: Equipment;

    @ManyToOne(() => EquipmentInspection)
    @JoinColumn({ name: 'inspection_id', referencedColumnName: 'inspection_id' })
    inspection?: EquipmentInspection;
}
