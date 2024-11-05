import { Property } from './property';
import { Account } from './account';

export interface JobStatus {
    value: string;
    label: string;
    color: string;
}

export interface JobType {
    name: string;
    fields: any[]; // TODO: Define field types when needed
}

export interface Job {
    job_id: string;
    name: string;
    type: string;
    status: string;
    property?: Property;
    account?: Account;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateJobDto {
    name: string;
    type: string;
    status?: string;
    property_id?: string;
    account_id?: string;
}

export interface UpdateJobDto {
    name?: string;
    type?: string;
    status?: string;
    property_id?: string;
    account_id?: string;
}
