import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, AfterLoad } from 'typeorm';
import { Point } from 'geojson';

interface IEquipment {
    equipment_id: string;
    job_id: string;
    equipment_type_id: string;
    location?: { latitude: number; longitude: number };
    is_georeferenced: boolean;
    status: string;
    created_at: string;
    updated_at: string;
}

@Entity('field_equipment')
export class Equipment implements Omit<IEquipment, 'location'> {
    @PrimaryGeneratedColumn('uuid', { name: 'equipment_id' })
    equipment_id: string;

    @Column({ name: 'job_id' })
    job_id: string;

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

    @Column('jsonb', { name: 'data', default: {} })
    data: {
        is_interior?: boolean;
        floor?: string | number;
        barcode?: string | null;
        photo?: string | null;
        [key: string]: any;
    } = {};  

    @CreateDateColumn({ name: 'created_at' })
    created_at: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: string;

    // Virtual property to match the shared interface
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

    @AfterLoad()
    private convertData() {
        // Ensure data exists
        this.data = this.data || {};
        
        // Handle floor value
        if (this.data.floor === null || this.data.floor === undefined) {
            this.data.floor = null;
        } else if (this.data.floor === 'G') {
            this.data.floor = 'G';
        } else {
            const parsed = parseInt(this.data.floor as string);
            this.data.floor = isNaN(parsed) ? this.data.floor : parsed;
        }
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

    // Transform data for frontend
    toJSON() {
        const { locationPoint, ...rest } = this;
        return {
            equipment_id: this.equipment_id,
            name: `Equipment ${this.equipment_id.slice(0, 8)}`, // Generate a name since we don't store it
            type: this.equipment_type_id,
            status: this.status,
            property_id: '', // This will be derived from the job
            job_id: this.job_id,
            data: this.data || {},
            created_at: this.created_at,
            updated_at: this.updated_at,
            location: this.locationPoint ? {
                coordinates: this.locationPoint.coordinates
            } : undefined
        };
    }
}
