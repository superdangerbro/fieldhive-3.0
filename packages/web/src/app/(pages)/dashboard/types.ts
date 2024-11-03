export interface DashboardMetrics {
    id: string;
    timestamp: string;
    value: number;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
}

export interface DashboardWidget {
    id: string;
    type: 'chart' | 'map' | 'metric' | 'table';
    title: string;
    data: DashboardMetrics[];
}

export interface DashboardConfig {
    id: string;
    name: string;
    layout: {
        widgets: Array<{
            id: string;
            type: DashboardWidget['type'];
            position: { x: number; y: number; w: number; h: number };
            settings: Record<string, unknown>;
        }>;
    };
    refreshInterval: number; // in seconds
    autoRefresh: boolean;
}
