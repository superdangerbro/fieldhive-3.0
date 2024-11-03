import { BaseModel, GeoPolygon } from '../../core/types';

export interface Field extends BaseModel {
    name: string;
    boundary: GeoPolygon;
    area: number; // in hectares
    status: 'active' | 'inactive';
}
