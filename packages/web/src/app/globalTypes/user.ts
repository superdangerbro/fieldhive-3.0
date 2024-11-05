export interface User {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_contact?: boolean;
    created_at?: Date;
    updated_at?: Date;
}
