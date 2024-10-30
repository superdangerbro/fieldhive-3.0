import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Point, Polygon } from 'geojson';
import { PropertyType, PropertyStatus } from '@fieldhive/shared';
import { Account } from './Account';

@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn('uuid', { name: 'property_id' })
    id: string;

    @Column()
    name: string;

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
        type: 'text'
    })
    type: PropertyType;

    @Column({
        type: 'text',
        default: 'active'
    })
    status: PropertyStatus;

    @ManyToOne(() => Account, account => account.properties)
    @JoinColumn({ name: 'account_id' })
    account: Account;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
