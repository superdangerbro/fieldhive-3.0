import type { JobStatus } from '@fieldhive/shared';

export const JOB_STATUSES: JobStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

export const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'in_progress':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return undefined;
  }
};

export const formatAddress = (address: any) => {
  if (!address) return 'N/A';
  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.postal_code
  ].filter(Boolean);
  return parts.join(', ');
};
