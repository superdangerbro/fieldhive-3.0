interface Account {
    account_id: string;
    name: string;
    type: string;
    status: string;
    billing_address_id: string | null;
    billing_address: {
        address_id: string;
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
    } | null;
    properties: Array<{
        property_id: string;
        name: string;
    }>;
    users: any[];
    created_at: string;
    updated_at: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
}

export const transformAccount = (apiAccount: any): Account => {
    console.log('Raw API account:', apiAccount);
    
    const transformed = {
        account_id: apiAccount.account_id,
        name: apiAccount.name,
        type: apiAccount.type,
        status: apiAccount.status,
        billing_address_id: apiAccount.billing_address_id,
        billing_address: apiAccount.billing_address || apiAccount.billingAddress,
        properties: apiAccount.properties || [],
        users: apiAccount.users || [],
        created_at: apiAccount.created_at,
        updated_at: apiAccount.updated_at,
        contact_name: apiAccount.contact_name,
        contact_email: apiAccount.contact_email,
        contact_phone: apiAccount.contact_phone
    };
    
    console.log('Transformed account:', transformed);
    return transformed;
};
