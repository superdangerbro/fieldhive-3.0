export interface Setting {
    setting_id: string;
    key: string;
    value: string;
    type: string;
    category: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateSettingDto {
    key: string;
    value: string;
    type: string;
    category: string;
}

export interface UpdateSettingDto {
    key?: string;
    value?: string;
    type?: string;
    category?: string;
}
