export interface PropertyTypeConfig {
    name: string;
}

export interface PropertyStatusConfig {
    name: string;
    color: string;
}

export interface PropertyTypesResponse {
    types: PropertyTypeConfig[];
}

export interface PropertyStatusesResponse {
    statuses: PropertyStatusConfig[];
}
