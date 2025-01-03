import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, AfterLoad, ManyToOne, JoinColumn } from 'typeorm';
import { Point } from 'geojson';
import { Job } from '../../jobs/entities/Job';

interface IEquipment {
    equipment_id: string;
    job_id: string;
    equipment_type_id: string;
    location?: { latitude: number; longitude: number };
    is_georeferenced: boolean;
    status: string;
    created_at: string;
    updated_at: string;
    job?: Job;
}

@Entity('field_equipment')
export class Equipment implements IEquipment {
    @PrimaryGeneratedColumn('uuid', { name: 'equipment_id' })
    equipment_id: string;

    @Column({ name: 'job_id' })
    job_id: string;

    @ManyToOne(() => Job)
    @JoinColumn({ name: 'job_id' })
    job: Job;

    @Column({ name: 'equipment_type_id' })
    equipment_type_id: string;

    @Column('geometry', {
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
        name: 'location'
    })
    private locationPoint?: Point;

    @Column({ name: 'is_georeferenced', default: true })
    is_georeferenced: boolean;

    @Column({ type: 'varchar', name: 'status', default: 'active' })
    status: string;

    @Column({ type: 'varchar', name: 'barcode', nullable: true })
    barcode: string | null;

    @Column({ type: 'varchar', name: 'photo_url', nullable: true })
    photo_url: string | null;

    @Column('jsonb', { name: 'data', default: {} })
    data: {
        is_interior?: boolean;
        floor?: string | number | null;
        [key: string]: any;
    } = {};  

    @CreateDateColumn({ name: 'created_at' })
    created_at: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: string;

    location?: { latitude: number; longitude: number };

    @AfterLoad()
    private convertPointToLocation() {
        if (this.locationPoint && this.locationPoint.coordinates) {
            this.location = {
                latitude: this.locationPoint.coordinates[1],
                longitude: this.locationPoint.coordinates[0]
            };
        }
    }

    toJSON() {
        const { locationPoint, ...rest } = this;
        return {
            ...rest,
            location: this.location,
            type: this.equipment_type_id // Add type for consistency
        };
    }

    // Helper method to set location from lat/lng
    setLocation(latitude: number, longitude: number) {
        this.locationPoint = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };
        this.location = { latitude, longitude };
    }

    // Helper method to clear location
    clearLocation() {
        this.locationPoint = undefined;
        this.location = undefined;
    }
}
