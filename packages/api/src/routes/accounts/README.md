# Accounts Module

This module handles all account-related operations with a modular, maintainable structure.

## Directory Structure

```
accounts/
├── handlers/              # Route handlers
│   ├── create.ts         # Account creation
│   ├── list.ts          # Account listing/retrieval
│   ├── update.ts        # Account updates & property links
│   └── delete.ts        # Account deletion
│
├── queries.ts           # SQL queries
├── types.ts            # TypeScript definitions
├── validation.ts       # Request validation
└── index.ts           # Route definitions & exports
```

## Key Features

- Account CRUD operations
- Property linking/unlinking
- Address management
- Type safety using shared types
- Input validation
- Transaction management
- Error handling
- Logging

## Usage Examples

### Basic Route Usage

```typescript
import accountsRouter from './routes/accounts';
app.use('/accounts', accountsRouter);
```

### Using Individual Handlers

```typescript
import { createAccount, updateAccount } from './routes/accounts';
import { validateCreateAccountRequest } from './routes/accounts';

router.post('/custom-accounts', validateCreateAccountRequest, createAccount);
```

### Type Usage

```typescript
import { AccountResponse, CreateAccountDto } from './routes/accounts';

const handleAccount = (account: AccountResponse) => {
    // Type-safe account handling
};
```

### Property Management

```typescript
// Link property
POST /accounts/:id/properties
{
    "property_id": "123",
    "role": "owner"
}

// Unlink property
DELETE /accounts/:id/properties/:propertyId
```

## Database Operations

All SQL queries are centralized in `queries.ts`:

```typescript
import { GET_ACCOUNTS_QUERY, CREATE_ACCOUNT_QUERY } from './queries';

const accounts = await AppDataSource.query(GET_ACCOUNTS_QUERY);
```

## Validation

Request validation is handled by middleware in `validation.ts`:

- Required fields
- Type validation
- Status validation
- Address validation

## Error Handling

Consistent error handling across all operations:

```typescript
try {
    // Operation logic
} catch (error) {
    logger.error('Error message:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Operation failed',
        details: error instanceof Error ? error.message : String(error)
    });
}
```

## Transaction Management

Transactions are used for operations that require multiple database changes:

```typescript
await AppDataSource.query('BEGIN');
try {
    // Database operations
    await AppDataSource.query('COMMIT');
} catch (error) {
    await AppDataSource.query('ROLLBACK');
    throw error;
}
```

## Response Format

Standard response format for accounts:

```typescript
interface AccountResponse {
    account_id: string;
    name: string;
    type: AccountType;
    status: AccountStatus;
    billing_address?: Address;
    properties?: Array<{
        property_id: string;
        name: string;
        role?: string;
    }>;
}
```

## Maintenance Guidelines

1. **Adding New Features**
   - Create handler in appropriate file
   - Add types to `types.ts`
   - Add validation if needed
   - Update README

2. **Modifying Queries**
   - Update in `queries.ts`
   - Add comments explaining complex queries
   - Consider impact on existing features

3. **Adding Validation**
   - Add to `validation.ts`
   - Consider reusability
   - Document requirements

4. **Error Handling**
   - Use consistent format
   - Include meaningful messages
   - Log appropriately

## Testing

To test the module:

```bash
# Run all tests
npm test routes/accounts

# Test specific handler
npm test routes/accounts/handlers/create.test.ts
```

## Dependencies

- Express
- TypeORM
- Winston (logging)
- TypeScript
- @fieldhive/shared (types)

## Contributing

1. Follow the modular structure
2. Add appropriate documentation
3. Use shared types
4. Add validation where needed
5. Consider backwards compatibility
6. Add tests for new features
