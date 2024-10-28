import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    address_id: string;

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

    @Column({ nullable: true })
    label: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
