import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Account } from '../../accounts/entities/Account';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
    user_id: string;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column({ name: 'is_contact' })
    is_contact: boolean;

    @Column({ name: 'first_name' })
    first_name: string;

    @Column({ name: 'last_name' })
    last_name: string;

    @Column({ name: 'password_digest' })
    password_digest: string;

    @ManyToMany(() => Account, account => account.users)
    accounts: Account[];

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
