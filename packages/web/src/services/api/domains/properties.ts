import { ApiClient, API_ENDPOINTS } from '../client';
import type { 
    Property, 
    CreatePropertyDto, 
    UpdatePropertyDto, 
    PropertiesResponse,
    PropertyType,
    PropertyStatus,
    Address,
    Account
} from '@fieldhive/shared';

export class PropertiesApi extends ApiClient {
    async getProperties(params?: { 
        search?: string; 
        limit?: number; 
        offset?: number; 
        accountId?: string 
    }): Promise<PropertiesResponse> {
        return this.get(API_ENDPOINTS.PROPERTIES, params as Record<string, string>);
    }

    async getPropertiesInBounds(bounds: [number, number, number, number]): Promise<PropertiesResponse> {
        const [west, south, east, north] = bounds;
        return this.get(`${API_ENDPOINTS.PROPERTIES}/spatial/bounds`, {
            bounds: `${west},${south},${east},${north}`
        });
    }

    async createProperty(property: CreatePropertyDto): Promise<Property> {
        return this.post(API_ENDPOINTS.PROPERTIES, property);
    }

    async updateProperty(id: string, property: UpdatePropertyDto): Promise<Property> {
        return this.put(`${API_ENDPOINTS.PROPERTIES}/${id}`, property);
    }

    async deleteProperty(id: string): Promise<{ success: boolean; error?: string; canArchive?: boolean }> {
        return this.delete(`${API_ENDPOINTS.PROPERTIES}/${id}`);
    }

    async archiveProperty(id: string): Promise<{ success: boolean }> {
        return this.post(`${API_ENDPOINTS.PROPERTIES}/${id}/archive`);
    }

    async updatePropertyMetadata(id: string, metadata: { 
        property_type?: PropertyType; 
        status?: PropertyStatus 
    }): Promise<Property> {
        return this.put(`${API_ENDPOINTS.PROPERTIES}/${id}/metadata`, metadata);
    }

    async getPropertyLocation(id: string): Promise<any> {
        return this.get(`${API_ENDPOINTS.PROPERTIES}/${id}/location`);
    }

    async getPropertyAddresses(id: string): Promise<{ 
        billing_address: Address | null, 
        service_address: Address | null 
    }> {
        return this.get(`${API_ENDPOINTS.PROPERTIES}/${id}/addresses`);
    }

    async getPropertyAccounts(propertyId: string): Promise<Account[]> {
        return this.get(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/accounts`);
    }
}
