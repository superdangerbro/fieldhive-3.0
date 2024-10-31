import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Point, Polygon } from 'geojson';
import { Account } from './Account';
import { Address } from './Address';

@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn('uuid', { name: 'property_id' })
    property_id: string;

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
        name: 'property_type',
        type: 'text',
        collation: 'aa_DJ',
        default: 'residential'
    })
    property_type: string;

    @Column({
        type: 'text',
        default: 'active'
    })
    status: string;

    @Column({ name: 'account_id' })
    account_id: string;

    @ManyToOne(() => Account, account => account.properties)
    @JoinColumn({ name: 'account_id' })
    account: Account;

    @Column({ name: 'billing_address_id', nullable: true })
    billing_address_id: string;

    @ManyToOne(() => Address)
    @JoinColumn({ name: 'billing_address_id' })
    billing_address: Address;

    @Column({ name: 'service_address_id', nullable: true })
    service_address_id: string;

    @ManyToOne(() => Address)
    @JoinColumn({ name: 'service_address_id' })
    service_address: Address;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
