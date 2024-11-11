import type { Address } from '@/app/globalTypes/address';

export const formatAddress = (address: Address | null | undefined): string => {
  if (!address) return 'No address';
  
  const parts = [];
  if (address.address1) parts.push(address.address1);
  if (address.address2) parts.push(address.address2);
  if (address.city) parts.push(address.city);
  if (address.province) parts.push(address.province);
  if (address.postal_code) parts.push(address.postal_code);
  
  return parts.length > 0 ? parts.join(', ') : 'No address';
};
