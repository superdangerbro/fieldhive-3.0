interface AddressDisplay {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
}

export const formatAddress = (address: AddressDisplay | null | undefined) => {
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
