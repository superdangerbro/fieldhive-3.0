# Schema Management and Synchronization

Date: October 25, 2023

## Current Database Schema

The PostgreSQL database has an existing schema with the following key tables:
- users
- user_roles
- accounts
- properties
- equipment_types
- jobs
- field_equipment

PostGIS is installed (version 3.4) for geospatial functionality.

## Architecture Overview

```
Frontend (Next.js)          Backend (Express)           Database (PostgreSQL)
     |                           |                            |
     |                           |                            |
     |     Shared Types (@fieldhive/shared)                  |
     |                           |                            |
     v                           v                            v
Type-safe API calls  <->  TypeORM Entities  <->  Database Tables
```

## Schema Management Process

1. **Database Schema Changes**
   - Location: PostgreSQL database
   - Tool: TypeORM migrations
   - Process: 
     ```sql
     -- Example migration
     CREATE TABLE users (
       user_id UUID PRIMARY KEY,
       username VARCHAR NOT NULL,
       -- other fields...
     );
     ```

2. **Backend Entity Mapping**
   - Location: `packages/api/src/entities/`
   - Tool: TypeORM entities
   - Process:
     ```typescript
     @Entity('users')
     export class User {
       @PrimaryColumn('uuid')
       id: string;
       // other fields...
     }
     ```

3. **Shared Types**
   - Location: `packages/shared/src/types/`
   - Used by: Both frontend and backend
   - Process:
     ```typescript
     export interface User {
       id: string;
       username: string;
       // other fields...
     }
     ```

## Schema Synchronization Flow

1. **Making Schema Changes**
   ```
   Create Migration -> Run Migration -> Update Entities -> Update Shared Types
   ```

2. **Type Safety**
   - Frontend gets type checking for API responses
   - Backend gets type checking for database operations
   - Shared types ensure consistency

3. **Development Workflow**
   ```
   1. Create migration script in packages/api/src/migrations/
   2. Run migration to update database
   3. Update TypeORM entities in packages/api/src/entities/
   4. Update shared types in packages/shared/src/types/
   5. Frontend and backend automatically get type checking
   ```

## Existing Tables Structure

The database already contains tables for:
1. User Management
   - users
   - user_roles
   - contacts

2. Property Management
   - properties
   - service_address
   - billing_address

3. Equipment Management
   - equipment_types
   - field_equipment
   - equipment_inspections
   - equipment_statuses

4. Job Management
   - jobs
   - job_types

5. Geospatial Features
   - PostGIS enabled
   - geometry_columns
   - spatial_ref_sys

## Best Practices

1. **Schema Changes**
   - Always create migrations for schema changes
   - Never modify production schema directly
   - Version control all migrations

2. **Type Safety**
   - Keep shared types in sync with database schema
   - Use TypeORM decorators for validation
   - Leverage TypeScript's type system

3. **Development Process**
   - Test migrations in development first
   - Update documentation when schema changes
   - Use TypeORM's query builder for complex queries

## Next Steps

1. Create TypeORM entities for existing tables
2. Set up migration system
3. Implement shared types
4. Add validation layer
5. Set up automated tests for database operations
