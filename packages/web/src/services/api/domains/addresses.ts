import { ApiClient, API_ENDPOINTS } from '../client';
import type { 
    Address, 
    CreateAddressDto, 
    UpdateAddressDto 
} from '@fieldhive/shared';

export class AddressesApi extends ApiClient {
    async getAddress(id: string): Promise<Address> {
        return this.get(`${API_ENDPOINTS.ADDRESSES}/${id}`);
    }

    async createAddress(address: CreateAddressDto): Promise<Address> {
        return this.post(API_ENDPOINTS.ADDRESSES, address);
    }

    async updateAddress(id: string, address: UpdateAddressDto): Promise<Address> {
        return this.put(`${API_ENDPOINTS.ADDRESSES}/${id}`, address);
    }
}
