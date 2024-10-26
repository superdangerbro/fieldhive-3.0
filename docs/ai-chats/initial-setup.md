# Initial Setup

## Account Management System

The account management system has been designed with a progressive enhancement approach, allowing for flexible account creation and management:

### Core Features
- Basic account creation with minimal required fields (just name)
- Optional billing address and property information
- Support for future multi-step form workflows
- Full CRUD operations for accounts

### API Endpoints

#### GET /api/accounts
Lists all accounts with pagination support.
```typescript
interface AccountsResponse {
    accounts: AccountResponse[];
    total: number;
    page: number;
    pageSize: number;
}
```

#### GET /api/accounts/:id
Retrieves a specific account by ID.
```typescript
interface AccountResponse {
    id: string;
    name: string;
    billingAddress?: BillingAddress;
    status: AccountStatus;
    createdAt: string;
    updatedAt: string;
}
```

#### POST /api/accounts
Creates a new account. Only requires a name field, with optional billing address.
```typescript
interface CreateAccountDto {
    name: string;
    billingAddress?: BillingAddress;
    status?: AccountStatus;
}
```

#### PUT /api/accounts/:id
Updates an existing account.
```typescript
interface UpdateAccountDto {
    name?: string;
    billingAddress?: BillingAddress;
    status?: AccountStatus;
}
```

#### DELETE /api/accounts/:id
Deletes an account and its associated data.

### Database Schema
The account system uses several related tables:
- `accounts`: Core account information
- `billing_address`: Optional billing address details
- `properties`: Properties associated with accounts
- `properties_accounts_join`: Many-to-many relationship between properties and accounts

### Design Decisions
1. Made billing address optional to support progressive account setup
2. Separated property management from account creation
3. Maintained relationships between accounts, properties, and addresses for future use
4. Implemented proper transaction handling for data consistency
