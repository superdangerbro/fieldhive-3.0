export const formatAddress = (address: any) => {
  if (!address) return null;
  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.postal_code,
    address.country
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};
