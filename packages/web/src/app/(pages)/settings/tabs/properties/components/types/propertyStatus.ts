export interface PropertyStatus {
    name: string;
    color: string;
}

export interface PropertyStatusSettings {
    statuses: PropertyStatus[];
}

export interface EditingStatus {
    index: number;
    value: PropertyStatus;
}
