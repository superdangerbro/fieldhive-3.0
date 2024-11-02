import { ApiClient, API_ENDPOINTS } from '../client';

export class SettingsApi extends ApiClient {
    async getSetting(key: string): Promise<any> {
        try {
            return await this.get(`${API_ENDPOINTS.SETTINGS}/${key}`);
        } catch (error) {
            // Return default values for known settings
            if (error instanceof Error && error.message.includes('404')) {
                switch (key) {
                    case 'property_statuses':
                        return ['Active', 'Inactive', 'Archived', 'Pending'];
                    default:
                        throw error;
                }
            }
            throw error;
        }
    }

    async updateSetting(key: string, value: any): Promise<any> {
        return this.put(`${API_ENDPOINTS.SETTINGS}/${key}`, { value });
    }

    // Equipment settings
    async getEquipmentTypes(): Promise<any> {
        return this.getSetting('equipment_types');
    }

    async saveEquipmentTypes(types: any): Promise<any> {
        return this.updateSetting('equipment_types', types);
    }

    async getEquipmentStatuses(): Promise<any> {
        return this.getSetting('equipment_statuses');
    }

    async saveEquipmentStatuses(statuses: any): Promise<any> {
        return this.updateSetting('equipment_statuses', statuses);
    }
}
