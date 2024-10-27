import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Point, Polygon } from 'geojson';
import { PropertyType, PropertyStatus } from '@fieldhive/shared';

@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn('uuid')
    property_id: string;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326
    })
    location: Point;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326,
        nullable: true
    })
    boundary?: Polygon;

    @Column({
        type: 'varchar',
        enum: PropertyType,
        default: PropertyType.RESIDENTIAL
    })
    type: PropertyType;

    @Column({
        type: 'varchar',
        enum: PropertyStatus,
        default: PropertyStatus.ACTIVE
    })
    status: PropertyStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
