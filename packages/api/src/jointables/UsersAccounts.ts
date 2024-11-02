import { Entity, PrimaryColumn } from 'typeorm';

@Entity('users_accounts')
export class UsersAccounts {
    @PrimaryColumn({ name: 'user_id' })
    user_id: string;

    @PrimaryColumn({ name: 'account_id' })
    account_id: string;
}
