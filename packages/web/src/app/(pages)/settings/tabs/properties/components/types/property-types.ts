export interface PropertyType {
    name: string;
    color: string;
}

export interface PropertyTypeSettings {
    types: PropertyType[];
}

export interface EditingType {
    index: number;
    value: PropertyType;
}
