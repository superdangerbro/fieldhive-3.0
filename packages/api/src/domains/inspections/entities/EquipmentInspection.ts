import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Equipment } from '../../equipment/entities/Equipment';
import { User } from '../../users/entities/User';
import { Property } from '../../properties/entities/Property';
import { InspectionJob } from './InspectionJob';
import { Point } from 'geojson';

@Entity('equipment_inspections')
export class EquipmentInspection {
    @PrimaryGeneratedColumn('uuid', { name: 'inspection_id' })
    inspection_id: string;

    @Column({ name: 'equipment_id' })
    equipment_id: string;

    @Column({ name: 'inspector_id' })
    inspector_id: string;

    @Column({ type: 'varchar', nullable: true })
    barcode?: string;

    @Column({ type: 'varchar', nullable: true })
    notes?: string;

    @Column({ name: 'image_url', type: 'text', nullable: true })
    image_url?: string;

    @Column({ type: 'jsonb', nullable: true })
    data?: Record<string, any>;

    @Column({ name: 'job_id', type: 'uuid', nullable: true })
    job_id?: string;

    @Column({
        name: 'location',
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true
    })
    location?: Point;

    @Column({ name: 'property_id', type: 'uuid', nullable: true })
    property_id?: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updated_at: Date;

    // Relationships
    @ManyToOne(() => Equipment)
    @JoinColumn({ name: 'equipment_id', referencedColumnName: 'equipment_id' })
    equipment: Equipment;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'inspector_id', referencedColumnName: 'user_id' })
    inspector: User;

    @ManyToOne(() => InspectionJob, { nullable: true })
    @JoinColumn({ name: 'job_id' })
    job?: InspectionJob;

    @ManyToOne(() => Property, { nullable: true })
    @JoinColumn({ name: 'property_id', referencedColumnName: 'property_id' })
    property?: Property;
}
