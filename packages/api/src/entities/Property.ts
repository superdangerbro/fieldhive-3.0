import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Point, Polygon } from 'geojson';
import { PropertyType, PropertyStatus } from '@fieldhive/shared';
import { Address } from './Address';

@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn('uuid')
    property_id: string;

    @Column()
    name: string;

    // Service Address fields (physical location)
    @Column()
    address1: string;

    @Column({ nullable: true })
    address2: string;

    @Column()
    city: string;

    @Column()
    province: string;

    @Column()
    postal_code: string;

    @Column()
    country: string;

    // Billing Address reference
    @ManyToOne(() => Address, { nullable: true })
    @JoinColumn({ name: 'billing_address_id' })
    billing_address: Address;

    @Column({ nullable: true })
    billing_address_id: string;

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
