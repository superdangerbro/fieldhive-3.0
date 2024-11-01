import type { Property, Job } from '@fieldhive/shared';

export interface MapProperty extends Property {
    job_stats?: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        latest?: {
            title: string;
            status: string;
            created_at: string;
        };
    };
}

export interface MapPropertyMarkerProps {
    property: MapProperty;
    onClick: (property: MapProperty) => void;
}
