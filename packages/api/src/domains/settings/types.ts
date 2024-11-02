import { Setting } from './entities/Setting';

export interface CreateSettingDto {
    key: string;
    value: any;
    description?: string;
}

export interface UpdateSettingDto {
    key?: string;
    value?: any;
    description?: string;
}

export interface SettingResponse extends Setting {
    setting_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface SettingFilters {
    key?: string;
}
