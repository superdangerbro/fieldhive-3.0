export interface AddressFormData {
    address1: string;
    address2: string | undefined;  // Make address2 optional since it can be undefined
    city: string;
    province: string;
    postal_code: string;
    country: string;
}

export const emptyAddressForm: AddressFormData = {
    address1: '',
    address2: '',  // Default to empty string
    city: '',
    province: '',
    postal_code: '',
    country: ''
};

export interface JobType {
    job_type_id: string;
    name: string;
}
