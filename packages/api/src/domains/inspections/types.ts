import { Inspection } from './entities/Inspection';
import { Property } from '../properties/entities/Property';

export type InspectionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface CreateInspectionDto {
    title: string;
    description?: string;
    property_id: string;
    status?: InspectionStatus;
    data?: Record<string, any>;
    scheduled_date?: Date;
}

export interface UpdateInspectionDto {
    title?: string;
    description?: string;
    property_id?: string;
    status?: InspectionStatus;
    data?: Record<string, any>;
    scheduled_date?: Date;
    completed_date?: Date;
}

export interface InspectionResponse extends Omit<Inspection, 'property'> {
    property: Property;
    created_at: Date;
    updated_at: Date;
}

export interface InspectionFilters {
    status?: InspectionStatus;
    property_id?: string;
    scheduled_date?: Date;
}

// For eager loading relationships
export interface InspectionWithRelations extends Inspection {
    property: Property;
}
