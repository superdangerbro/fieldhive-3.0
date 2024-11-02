import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid', { name: 'address_id' })
    address_id: string;

    @Column()
    address1: string;

    @Column({ nullable: true })
    address2?: string;

    @Column()
    city: string;

    @Column()
    province: string;

    @Column({ name: 'postal_code' })
    postal_code: string;

    @Column()
    country: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
