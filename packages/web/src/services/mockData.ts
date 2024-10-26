import { v4 as uuidv4 } from 'uuid';

export interface Account {
    id: string;
    name: string;
    is_company: boolean;
    billingAddress: {
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    };
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
}

export const mockAccounts: Account[] = [
    {
        id: uuidv4(),
        name: 'Acme Corporation',
        is_company: true,
        billingAddress: {
            address1: '123 Main St',
            address2: 'Suite 100',
            city: 'Vancouver',
            province: 'BC',
            postalCode: 'V6B 4N7',
            country: 'Canada'
        },
        status: 'active',
        createdAt: new Date(2023, 0, 15).toISOString(),
        updatedAt: new Date(2023, 9, 1).toISOString()
    },
    {
        id: uuidv4(),
        name: 'TechStart Inc',
        is_company: true,
        billingAddress: {
            address1: '456 Innovation Ave',
            city: 'Toronto',
            province: 'ON',
            postalCode: 'M5V 2H1',
            country: 'Canada'
        },
        status: 'active',
        createdAt: new Date(2023, 2, 1).toISOString(),
        updatedAt: new Date(2023, 9, 15).toISOString()
    },
    {
        id: uuidv4(),
        name: 'Global Solutions Ltd',
        is_company: true,
        billingAddress: {
            address1: '789 Business Blvd',
            address2: 'Floor 15',
            city: 'Montreal',
            province: 'QC',
            postalCode: 'H2Y 1N9',
            country: 'Canada'
        },
        status: 'suspended',
        createdAt: new Date(2023, 4, 10).toISOString(),
        updatedAt: new Date(2023, 9, 20).toISOString()
    },
    {
        id: uuidv4(),
        name: 'Eco Farms Co',
        is_company: true,
        billingAddress: {
            address1: '321 Rural Route',
            city: 'Calgary',
            province: 'AB',
            postalCode: 'T2P 1J9',
            country: 'Canada'
        },
        status: 'inactive',
        createdAt: new Date(2023, 6, 1).toISOString(),
        updatedAt: new Date(2023, 9, 25).toISOString()
    },
    {
        id: uuidv4(),
        name: 'Smart Agriculture Inc',
        is_company: true,
        billingAddress: {
            address1: '654 Tech Way',
            address2: 'Unit 200',
            city: 'Ottawa',
            province: 'ON',
            postalCode: 'K1P 1J1',
            country: 'Canada'
        },
        status: 'active',
        createdAt: new Date(2023, 7, 15).toISOString(),
        updatedAt: new Date(2023, 9, 30).toISOString()
    }
];
