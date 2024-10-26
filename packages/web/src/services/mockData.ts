import { v4 as uuidv4 } from 'uuid';

export interface Account {
    id: string;
    name: string;
    billingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
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
        billingAddress: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
        },
        status: 'active',
        createdAt: new Date(2023, 0, 15).toISOString(),
        updatedAt: new Date(2023, 9, 1).toISOString()
    },
    {
        id: uuidv4(),
        name: 'TechStart Inc',
        billingAddress: {
            street: '456 Innovation Ave',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            country: 'USA'
        },
        status: 'active',
        createdAt: new Date(2023, 2, 1).toISOString(),
        updatedAt: new Date(2023, 9, 15).toISOString()
    },
    {
        id: uuidv4(),
        name: 'Global Solutions Ltd',
        billingAddress: {
            street: '789 Business Blvd',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
        },
        status: 'suspended',
        createdAt: new Date(2023, 4, 10).toISOString(),
        updatedAt: new Date(2023, 9, 20).toISOString()
    },
    {
        id: uuidv4(),
        name: 'Eco Farms Co',
        billingAddress: {
            street: '321 Rural Route',
            city: 'Portland',
            state: 'OR',
            zipCode: '97201',
            country: 'USA'
        },
        status: 'inactive',
        createdAt: new Date(2023, 6, 1).toISOString(),
        updatedAt: new Date(2023, 9, 25).toISOString()
    },
    {
        id: uuidv4(),
        name: 'Smart Agriculture Inc',
        billingAddress: {
            street: '654 Tech Way',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            country: 'USA'
        },
        status: 'active',
        createdAt: new Date(2023, 7, 15).toISOString(),
        updatedAt: new Date(2023, 9, 30).toISOString()
    }
];
