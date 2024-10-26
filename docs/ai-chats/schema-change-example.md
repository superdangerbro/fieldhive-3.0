# Example: Making a Schema Change

This example demonstrates the complete process of adding a new field to an existing table.

## Example Change: Adding a `status` field to the `users` table

### 1. Create Migration Script
Location: `packages/api/src/migrations/[timestamp]-add-user-status.ts`
```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserStatus implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the new column
        await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN status VARCHAR(50) DEFAULT 'active'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the column if rolling back
        await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN status
        `);
    }
}
```

### 2. Update TypeORM Entity
Location: `packages/api/src/entities/User.ts`
```typescript
@Entity('users')
export class User {
    // ... existing fields ...

    @Column({
        type: 'varchar',
        length: 50,
        default: 'active'
    })
    status: string;
}
```

### 3. Update Shared Types
Location: `packages/shared/src/types/user.ts`
```typescript
export interface User {
    // ... existing fields ...
    status: 'active' | 'inactive' | 'suspended';
}
```

### 4. Update API Endpoints
Location: `packages/api/src/routes/users.ts`
```typescript
router.patch('/:userId/status', async (req, res) => {
    const { status } = req.body;
    const user = await userRepository.update(req.params.userId, { status });
    res.json(user);
});
```

### 5. Update Frontend Components
Location: `packages/web/src/components/UserList.tsx`
```typescript
import { User } from '@fieldhive/shared';

interface Props {
    users: User[];
}

export const UserList: React.FC<Props> = ({ users }) => {
    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>
                    {user.name} - {user.status}
                </li>
            ))}
        </ul>
    );
}
```

## Step-by-Step Process for Making Schema Changes

1. **Create Migration**
   ```bash
   # Generate migration file
   pnpm --filter @fieldhive/api typeorm migration:create src/migrations/AddUserStatus
   
   # After writing migration
   pnpm --filter @fieldhive/api typeorm migration:run
   ```

2. **Update Backend**
   - Update TypeORM entity
   - Add validation if needed
   - Update API endpoints
   - Run tests

3. **Update Shared Types**
   - Add new fields to interfaces
   - Update validation schemas
   - Run type checks

4. **Update Frontend**
   - Update components
   - Add new fields to forms
   - Update tests

5. **Test End-to-End**
   - Test database changes
   - Test API endpoints
   - Test frontend updates

## Automated Type Checking

The TypeScript compiler will automatically catch type mismatches:

```typescript
// Frontend: This will cause a type error if status is not updated in shared types
const user: User = {
    id: '123',
    name: 'John',
    // TypeScript error if status is missing or invalid
};

// Backend: TypeORM will validate against the entity definition
userRepository.save({
    // TypeScript error if required fields are missing
});
```

## Rolling Back Changes

If something goes wrong:

1. **Roll Back Migration**
   ```bash
   pnpm --filter @fieldhive/api typeorm migration:revert
   ```

2. **Revert Code Changes**
   - Revert entity changes
   - Revert shared types
   - Revert frontend changes

## Best Practices

1. **Always Create Migrations**
   - Never modify the database schema directly
   - Keep migrations versioned in source control
   - Test migrations in development first

2. **Type Safety**
   - Keep shared types in sync with database schema
   - Use strict TypeScript checks
   - Add runtime validation where needed

3. **Testing**
   - Test migrations both up and down
   - Add tests for new API endpoints
   - Update frontend integration tests

4. **Documentation**
   - Update API documentation
   - Document breaking changes
   - Keep schema documentation current

## Common Issues and Solutions

1. **Migration Fails**
   - Check database connection
   - Verify SQL syntax
   - Check for existing data constraints

2. **Type Errors**
   - Update all related interfaces
   - Check for missing imports
   - Verify TypeORM decorators

3. **Runtime Errors**
   - Add data validation
   - Handle edge cases
   - Add error logging

## Development Workflow Tips

1. **Branch Strategy**
   ```bash
   # Create feature branch
   git checkout -b feature/add-user-status
   
   # Commit changes in order
   git add packages/api/src/migrations/
   git commit -m "Add user status migration"
   
   git add packages/shared/src/types/
   git commit -m "Update shared types for user status"
   
   git add packages/api/src/entities/
   git commit -m "Update User entity with status field"
   ```

2. **Testing Strategy**
   - Write migration tests first
   - Update API tests
   - Add frontend integration tests
   - Test rollback procedure

3. **Deployment Strategy**
   - Run migrations before deploying new code
   - Have rollback plan ready
   - Monitor for errors after deployment
