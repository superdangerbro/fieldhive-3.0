export interface Setting {
    id: string;
    key: string;
    value: any;
    created_at: Date;
    updated_at: Date;
}

export interface CreateSettingDto {
    key: string;
    value: any;
}

export interface UpdateSettingDto {
    key?: string;
    value?: any;
}

export interface SettingResponse {
    id: string;
    key: string;
    value: any;
    created_at: Date;
    updated_at: Date;
}

export interface SettingFilters {
    key?: string;
}
