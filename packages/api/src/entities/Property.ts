import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Point, Polygon } from 'geojson';
import { PropertyType, PropertyStatus } from '@fieldhive/shared';
import { Account } from './Account';

@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
        type: 'text'
    })
    type: PropertyType;

    @Column({
        type: 'text',
        default: 'active'
    })
    status: PropertyStatus;

    @ManyToMany(() => Account, account => account.properties)
    @JoinTable({
        name: 'properties_accounts_join',
        joinColumn: {
            name: 'property_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'account_id',
            referencedColumnName: 'id'
        }
    })
    accounts: Account[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
