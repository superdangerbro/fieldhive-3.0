import { ApiClient, API_ENDPOINTS } from '../client';
import type { 
    Job, 
    CreateJobDto, 
    UpdateJobDto, 
    JobsResponse 
} from '@fieldhive/shared';

export class JobsApi extends ApiClient {
    async getJobs(page: number, pageSize: number): Promise<JobsResponse> {
        return this.get(API_ENDPOINTS.JOBS, {
            page: page.toString(),
            pageSize: pageSize.toString()
        });
    }

    async getJobTypes(): Promise<{ jobTypes: { id: string; name: string }[] }> {
        return this.get(`${API_ENDPOINTS.SETTINGS}/job_types`);
    }

    async createJob(data: CreateJobDto): Promise<Job> {
        return this.post(API_ENDPOINTS.JOBS, {
            ...data,
            property_id: data.propertyId,
            job_type_id: data.jobTypeId
        });
    }

    async updateJob(id: string, data: UpdateJobDto): Promise<Job> {
        return this.put(`${API_ENDPOINTS.JOBS}/${id}`, data);
    }

    async deleteJob(id: string): Promise<{ success: boolean }> {
        return this.delete(`${API_ENDPOINTS.JOBS}/${id}`);
    }
}
