# Domain Restructuring Instructions

[Previous content remains the same...]

## Validation & Error Handling Patterns

### 1. API Error Structure
```typescript
// core/types/error.ts
export interface ApiError {
  error: string;
  message: string;
  details?: string;
  code?: string;
  field?: string;
}

export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: string,
    public field?: string
  ) {
    super(message);
  }
}
```

### 2. Domain Validation

1. **Service Layer Validation**
```typescript
class EntityService {
  private validateCreate(data: CreateEntityDto): void {
    const errors: string[] = [];
    
    // Required fields
    if (!data.requiredField?.trim()) {
      errors.push('Required field is missing');
    }
    
    // Business rules
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      errors.push('Start date must be before end date');
    }
    
    if (errors.length > 0) {
      throw new DomainError(
        'Validation failed',
        'VALIDATION_ERROR',
        errors.join(', ')
      );
    }
  }
}
```

2. **Route Handler Error Handling**
```typescript
async function createEntity(req: Request, res: Response) {
  try {
    const result = await entityService.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      res.status(400).json({
        error: error.code,
        message: error.message,
        details: error.details
      });
    } else {
      logger.error('Unexpected error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      });
    }
  }
}
```

### 3. Frontend Error Handling

1. **API Client**
```typescript
// services/api/client.ts
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new DomainError(
      error.message,
      error.code,
      error.details,
      error.field
    );
  }
  return response.json();
}

export const client = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return handleResponse<T>(response);
  },
  // ... other methods
};
```

2. **Store Error Handling**
```typescript
// services/stores/domains/entity/entityStore.ts
interface EntityState {
  error: ApiError | null;
  setError: (error: ApiError | null) => void;
  clearError: () => void;
}

const useEntityStore = create<EntityState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  actions: {
    async createEntity(data: CreateEntityDto) {
      try {
        set({ loading: true, error: null });
        const result = await entityApi.create(data);
        set({ entity: result });
      } catch (error) {
        set({ 
          error: {
            message: error.message,
            code: error.code,
            details: error.details
          }
        });
      } finally {
        set({ loading: false });
      }
    }
  }
}));
```

3. **Component Error Handling**
```typescript
function EntityForm() {
  const { error, createEntity, clearError } = useEntityStore();
  
  const handleSubmit = async (data: CreateEntityDto) => {
    clearError();
    await createEntity(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error">
          {error.message}
          {error.details && (
            <Typography variant="caption">
              {error.details}
            </Typography>
          )}
        </Alert>
      )}
      {/* Form fields */}
    </form>
  );
}
```

### 4. Error Codes

Maintain consistent error codes across domains:

```typescript
export const ERROR_CODES = {
  // Validation Errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Not Found Errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Conflict Errors (409)
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business Logic Errors (422)
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE: 'INVALID_STATE',
  
  // Server Errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
} as const;
```

### 5. Logging Pattern

```typescript
// core/utils/logger.ts
export const logger = {
  error: (message: string, error: unknown) => {
    console.error(message, {
      ...(error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error),
      timestamp: new Date().toISOString()
    });
  },
  // ... other methods
};
```

### Notes

- Always validate at the service layer
- Use typed error codes
- Include helpful error messages
- Log errors with context
- Handle errors gracefully in UI
- Show user-friendly messages
- Maintain error state in stores
- Clear errors appropriately
- Use consistent error structure
