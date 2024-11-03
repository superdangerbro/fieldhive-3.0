import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, AfterLoad } from 'typeorm';
import { Point } from 'geojson';
import { Equipment as IEquipment } from '@fieldhive/shared';

@Entity('field_equipment')
export class Equipment implements Omit<IEquipment, 'location'> {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    type: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'text' })
    status: string;

    @Column('geometry', {
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true
    })
    private locationPoint?: Point;

    @Column({ type: 'timestamp', nullable: true })
    lastMaintenance?: string;

    @Column({ type: 'timestamp', nullable: true })
    nextMaintenance?: string;

    @Column('jsonb')
    properties: Record<string, any>;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

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

    toJSON(): IEquipment {
        const { locationPoint, ...rest } = this;
        return rest;
    }
}
