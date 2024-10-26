import { Point, Polygon } from 'geojson';
import { Account } from './account';
export interface Property {
    id: string;
    name: string;
    address: string;
    location: Point;
    boundary?: Polygon;
    area?: number;
    accounts: PropertyAccount[];
    status: PropertyStatus;
    type: PropertyType;
    createdAt: string;
    updatedAt: string;
}
export interface PropertyAccount {
    propertyId: string;
    accountId: string;
    account: Account;
    role: PropertyAccountRole;
    createdAt: string;
    updatedAt: string;
}
export interface Job {
    id: string;
    propertyId: string;
    property: Property;
    name: string;
    description?: string;
    status: JobStatus;
    startDate?: string;
    endDate?: string;
    type: JobType;
    priority: JobPriority;
    createdAt: string;
    updatedAt: string;
}
export declare enum PropertyStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived"
}
export declare enum PropertyType {
    RESIDENTIAL = "residential",
    COMMERCIAL = "commercial",
    INDUSTRIAL = "industrial",
    AGRICULTURAL = "agricultural",
    MIXED_USE = "mixed_use"
}
export declare enum PropertyAccountRole {
    OWNER = "owner",
    MANAGER = "manager",
    TENANT = "tenant",
    CONTRACTOR = "contractor"
}
export declare enum JobStatus {
    DRAFT = "draft",
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum JobType {
    INSPECTION = "inspection",
    MAINTENANCE = "maintenance",
    INSTALLATION = "installation",
    REPAIR = "repair",
    SURVEY = "survey",
    OTHER = "other"
}
export declare enum JobPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export interface CreatePropertyRequest {
    name: string;
    address: string;
    location: Point;
    boundary?: Polygon;
    type: PropertyType;
    accountConnections: {
        accountId: string;
        role: PropertyAccountRole;
    }[];
}
export interface UpdatePropertyRequest {
    name?: string;
    address?: string;
    location?: Point;
    boundary?: Polygon;
    type?: PropertyType;
    status?: PropertyStatus;
}
export interface CreateJobRequest {
    propertyId: string;
    name: string;
    description?: string;
    type: JobType;
    priority: JobPriority;
    startDate?: string;
    endDate?: string;
}
export interface UpdateJobRequest {
    name?: string;
    description?: string;
    status?: JobStatus;
    type?: JobType;
    priority?: JobPriority;
    startDate?: string;
    endDate?: string;
}
export interface PropertyResponse {
    success: boolean;
    data: Property;
}
export interface PropertiesResponse {
    success: boolean;
    data: Property[];
    total: number;
}
export interface JobResponse {
    success: boolean;
    data: Job;
}
export interface JobsResponse {
    success: boolean;
    data: Job[];
    total: number;
}
export interface PropertySearchParams {
    query?: string;
    accountId?: string;
    type?: PropertyType;
    status?: PropertyStatus;
    bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    page?: number;
    limit?: number;
    sortBy?: keyof Property;
    sortOrder?: 'asc' | 'desc';
}
export interface JobSearchParams {
    query?: string;
    propertyId?: string;
    status?: JobStatus;
    type?: JobType;
    priority?: JobPriority;
    dateRange?: {
        start: string;
        end: string;
    };
    page?: number;
    limit?: number;
    sortBy?: keyof Job;
    sortOrder?: 'asc' | 'desc';
}
