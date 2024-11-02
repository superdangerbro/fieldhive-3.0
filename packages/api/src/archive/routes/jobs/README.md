# Jobs Module

This module handles all job-related operations with a modular, maintainable structure.

## Directory Structure

```
jobs/
├── handlers/           # Route handlers
│   ├── create.ts      # Job creation logic
│   ├── list.ts        # Job listing/retrieval
│   ├── update.ts      # Job update logic
│   └── delete.ts      # Job deletion
│
├── queries.ts         # SQL queries
├── types.ts          # TypeScript definitions
├── validation.ts     # Request validation
└── index.ts         # Route definitions & exports
```

## Key Features

- Modular organization
- Type safety
- Input validation
- Transaction management
- Error handling
- Logging
- Backwards compatibility

## Usage Examples

### Basic Route Usage

```typescript
import jobsRouter from './routes/jobs';
app.use('/jobs', jobsRouter);
```

### Using Individual Handlers

```typescript
import { createJob, updateJob } from './routes/jobs';
import { validateCreateJobRequest } from './routes/jobs';

router.post('/custom-jobs', validateCreateJobRequest, createJob);
```

### Type Usage

```typescript
import { JobResponse, CreateJobRequest } from './routes/jobs';

const handleJob = (job: JobResponse) => {
    // Type-safe job handling
};
```

### Validation Usage

```typescript
import { validateCreateJobRequest } from './routes/jobs';

router.post('/jobs', validateCreateJobRequest, customHandler);
```

## Database Operations

All SQL queries are centralized in `queries.ts`:

```typescript
import { GET_JOBS_QUERY, CREATE_JOB_QUERY } from './queries';

const jobs = await AppDataSource.query(GET_JOBS_QUERY);
```

## Validation

Request validation is handled by middleware in `validation.ts`:

- Required fields
- Status validation
- Address validation
- Type checking

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

Standard response format for jobs:

```typescript
interface JobResponse {
    job_id: string;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    // ... other fields
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
npm test routes/jobs

# Test specific handler
npm test routes/jobs/handlers/create.test.ts
```

## Dependencies

- Express
- TypeORM
- Winston (logging)
- TypeScript

## Contributing

1. Follow the modular structure
2. Add appropriate documentation
3. Include types
4. Add validation where needed
5. Consider backwards compatibility
6. Add tests for new features
