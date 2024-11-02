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
