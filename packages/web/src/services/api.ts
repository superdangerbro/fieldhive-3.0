// API base URL
const API_BASE = 'http://localhost:3001/api';

// API endpoints
export const API_ENDPOINTS = {
    ACCOUNTS: `${API_BASE}/accounts`,
    DASHBOARD: `${API_BASE}/dashboard`,
    EQUIPMENT_TYPES: `${API_BASE}/equipment_types`,
    FIELD_EQUIPMENT: `${API_BASE}/field_equipment`,
    FIELDS: `${API_BASE}/fields`,
    HEALTH: `${API_BASE}/health`,
    INSPECTIONS: `${API_BASE}/inspections`,
    JOB_TYPES: `${API_BASE}/job_types`,
    JOBS: `${API_BASE}/jobs`,
    PROPERTIES: `${API_BASE}/properties`,
    SENSORS: `${API_BASE}/sensors`
};

// Generic API functions
export async function fetchData(endpoint: string) {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export async function postData(endpoint: string, data: any) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export async function putData(endpoint: string, data: any) {
    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export async function deleteData(endpoint: string) {
    const response = await fetch(endpoint, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Account APIs
export const getAccounts = () => fetchData(API_ENDPOINTS.ACCOUNTS);
export const createAccount = (data: any) => postData(API_ENDPOINTS.ACCOUNTS, data);
export const updateAccount = (id: string, data: any) => putData(`${API_ENDPOINTS.ACCOUNTS}/${id}`, data);
export const deleteAccount = (id: string) => deleteData(`${API_ENDPOINTS.ACCOUNTS}/${id}`);

// Job APIs
export const getJobs = () => fetchData(API_ENDPOINTS.JOBS);
export const createJob = (data: any) => postData(API_ENDPOINTS.JOBS, data);
export const updateJob = (id: string, data: any) => putData(`${API_ENDPOINTS.JOBS}/${id}`, data);
export const deleteJob = (id: string) => deleteData(`${API_ENDPOINTS.JOBS}/${id}`);

// Job Type APIs
export const getJobTypes = () => fetchData(API_ENDPOINTS.JOB_TYPES);
export const createJobType = (data: any) => postData(API_ENDPOINTS.JOB_TYPES, data);
export const updateJobType = (id: string, data: any) => putData(`${API_ENDPOINTS.JOB_TYPES}/${id}`, data);
export const deleteJobType = (id: string) => deleteData(`${API_ENDPOINTS.JOB_TYPES}/${id}`);

// Property APIs
import { PropertySearchParams, PropertiesResponse, Property, UpdatePropertyRequest } from '@fieldhive/shared';

export const getProperties = (params?: PropertySearchParams): Promise<PropertiesResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
        if (params.query) queryParams.append('search', params.query);
        if (params.bounds) queryParams.append('bounds', JSON.stringify([
            params.bounds.west,
            params.bounds.south,
            params.bounds.east,
            params.bounds.north
        ]));
        if (params.accountId) queryParams.append('accountId', params.accountId);
        if (params.type) queryParams.append('type', params.type);
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }
    const url = `${API_ENDPOINTS.PROPERTIES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return fetchData(url);
};

export const createProperty = (data: any) => postData(API_ENDPOINTS.PROPERTIES, data);
export const updateProperty = (id: string, data: UpdatePropertyRequest) => putData(`${API_ENDPOINTS.PROPERTIES}/${id}`, data);
export const deleteProperty = (id: string) => deleteData(`${API_ENDPOINTS.PROPERTIES}/${id}`);

// Equipment Type APIs
export const getEquipmentTypes = () => fetchData(API_ENDPOINTS.EQUIPMENT_TYPES);
export const saveEquipmentTypes = (data: any) => postData(API_ENDPOINTS.EQUIPMENT_TYPES, data);
export const getEquipmentStatuses = () => fetchData(`${API_ENDPOINTS.EQUIPMENT_TYPES}/status`);
export const saveEquipmentStatuses = (data: any) => postData(`${API_ENDPOINTS.EQUIPMENT_TYPES}/status`, data);

// Field Equipment APIs
export const getFieldEquipment = () => fetchData(API_ENDPOINTS.FIELD_EQUIPMENT);
export const createFieldEquipment = (data: any) => postData(API_ENDPOINTS.FIELD_EQUIPMENT, data);
export const updateFieldEquipment = (id: string, data: any) => putData(`${API_ENDPOINTS.FIELD_EQUIPMENT}/${id}`, data);
export const deleteFieldEquipment = (id: string) => deleteData(`${API_ENDPOINTS.FIELD_EQUIPMENT}/${id}`);
