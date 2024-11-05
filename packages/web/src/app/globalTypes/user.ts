export interface User {
    user_id: string;
    username: string;
    email: string;
    phone: string;
    is_contact: boolean;
    first_name: string;
    last_name: string;
    created_at?: Date;
    updated_at?: Date;
}
