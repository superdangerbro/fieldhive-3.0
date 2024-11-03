// ... (previous types remain unchanged)

// Settings Types
export interface Setting {
    id: string;
    key: string;
    value: any;
    createdAt: Date;
    updatedAt: Date;
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
    createdAt: Date;
    updatedAt: Date;
}

export interface SettingFilters {
    key?: string;
}
