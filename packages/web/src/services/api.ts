import { Account, Property, CreateAccountDto, CreatePropertyRequest } from '@fieldhive/shared';
import { Contact } from '../components/properties/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AccountsResponse {
  accounts: Account[];
  total: number;
}

interface PropertiesResponse {
  properties: Property[];
  total: number;
}

interface JobType {
  id: string;
  name: string;
}

interface JobTypesResponse {
  jobTypes: JobType[];
}

interface Job {
  job_id: string;
  job_type: {
    job_type_id: string;
    name: string;
  };
  property: {
    property_id: string;
    name: string;
    address: string;
  };
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAccounts(): Promise<AccountsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts`);
    if (!response.ok) {
      throw new Error('Failed to fetch accounts');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return { accounts: [], total: 0 };
  }
}

export async function getProperties(page: number, pageSize: number): Promise<PropertiesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching properties:', error);
    return { properties: [], total: 0 };
  }
}

export async function createAccount(accountData: CreateAccountDto): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create account: ${error}`);
  }

  return response.json();
}

export async function updateAccount(accountId: string, accountData: CreateAccountDto): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update account: ${error}`);
  }

  return response.json();
}

export async function createProperty(data: CreatePropertyRequest): Promise<Property> {
  console.log('API createProperty payload:', JSON.stringify(data, null, 2));
  
  const response = await fetch(`${API_BASE_URL}/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create property error response:', errorText);
    throw new Error(`Failed to create property: ${errorText}`);
  }

  return response.json();
}

export async function updateProperty(propertyId: string, propertyData: CreatePropertyRequest): Promise<Property> {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(propertyData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update property error response:', errorText);
    throw new Error(`Failed to update property: ${errorText}`);
  }

  return response.json();
}

export async function getJobTypes(): Promise<JobTypesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/job-types`);
    if (!response.ok) {
      throw new Error('Failed to fetch job types');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching job types:', error);
    return { jobTypes: [] };
  }
}

export async function addJobType(jobTypeData: { name: string }): Promise<JobType> {
  const response = await fetch(`${API_BASE_URL}/job-types`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobTypeData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add job type: ${error}`);
  }

  return response.json();
}

export async function deleteJobType(jobTypeId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/job-types/${jobTypeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete job type: ${error}`);
  }
}

export async function getJobs(page: number, pageSize: number): Promise<JobsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return { jobs: [], total: 0, page, pageSize };
  }
}

export async function createJob(data: { property_id: string; job_type_id: string; notes?: string }): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create job: ${error}`);
  }

  return response.json();
}

export async function updateJob(jobId: string, data: { status?: string; notes?: string }): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update job: ${error}`);
  }

  return response.json();
}

export async function deleteJob(jobId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete job: ${error}`);
  }
}
