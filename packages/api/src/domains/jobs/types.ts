export interface CreateJobDto {
    title: string;
    description?: string;
    job_type_id: string;
    status?: string;
    account_ids?: string[];
    property_id?: string;
    use_custom_addresses?: boolean;
}

export interface UpdateJobDto {
    title?: string;
    description?: string;
    job_type_id?: string;
    status?: string;
    account_ids?: string[];
    property_id?: string;
    use_custom_addresses?: boolean;
}

export interface JobFilters {
    type?: string;
    status?: string;
    title?: string;
    property_id?: string;
    account_id?: string;
}
