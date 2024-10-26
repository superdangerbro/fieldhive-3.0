# Schema Analysis

## Current Issues

1. **Inconsistent Primary Key Naming**
   - Some tables use `_id` suffix: `equipment_type_id`, `user_id`
   - Others use `id` directly: `id` in `user_roles`
   - Recommendation: Standardize to `table_name_id` format

2. **Join Table Naming**
   - Inconsistent naming: `accounts_contacts_join` vs `properties_accounts_join`
   - Recommendation: Standardize to `table1_table2_join` format

3. **Spatial Data Handling**
   - Equipment locations stored as separate `longitude`/`latitude` columns
   - Not using PostGIS geometry types despite PostGIS being installed
   - Recommendation: Use PostGIS `POINT` type for locations

4. **Status Fields**
   - Multiple status implementations:
     - Separate `equipment_statuses` table
     - Boolean `is_georeferenced` field
     - `status` column in other tables
   - Recommendation: Standardize status handling

5. **Timestamp Handling**
   - Some tables missing `created_at`/`updated_at`
   - Inconsistent timestamp type usage
   - Recommendation: Add timestamp tracking to all tables

6. **Foreign Key Constraints**
   - Some relationships lack proper foreign key constraints
   - Example: `equipment_type` in `field_equipment`
   - Recommendation: Add missing foreign key constraints

7. **Enum Types**
   - Status values stored as strings
   - Could benefit from PostgreSQL ENUM types
   - Recommendation: Use ENUM types for status fields

8. **Indexing**
   - Missing indexes on frequently queried fields
   - Missing indexes on foreign key columns
   - Recommendation: Add appropriate indexes

9. **Nullable Fields**
   - Inconsistent handling of nullable fields
   - Some optional fields not marked as nullable
   - Recommendation: Explicitly define nullability

10. **Table Names**
    - Mix of singular and plural forms
    - Example: `beaver trap types` vs `equipment_types`
    - Recommendation: Standardize to plural form

## Suggested Improvements

1. **Standardize Primary Keys**
   ```sql
   ALTER TABLE user_roles 
   RENAME COLUMN id TO user_role_id;
   ```

2. **Add PostGIS Support**
   ```sql
   ALTER TABLE field_equipment 
   ADD COLUMN location geometry(Point, 4326),
   DROP COLUMN latitude,
   DROP COLUMN longitude;
   ```

3. **Add Missing Timestamps**
   ```sql
   ALTER TABLE equipment_types 
   ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
   ```

4. **Add Foreign Key Constraints**
   ```sql
   ALTER TABLE field_equipment
   ADD CONSTRAINT fk_equipment_type
   FOREIGN KEY (equipment_type) 
   REFERENCES equipment_types(equipment_type_id);
   ```

5. **Create ENUM Types**
   ```sql
   CREATE TYPE equipment_status AS ENUM (
     'active', 
     'maintenance', 
     'retired', 
     'lost'
   );
   ```

6. **Add Indexes**
   ```sql
   CREATE INDEX idx_field_equipment_type 
   ON field_equipment(equipment_type);
   ```

7. **Fix Table Names**
   ```sql
   ALTER TABLE "beaver trap types" 
   RENAME TO beaver_trap_types;
   ```

## Migration Strategy

1. **Phase 1: Non-breaking Changes**
   - Add missing timestamps
   - Create new indexes
   - Add missing constraints with validation

2. **Phase 2: Data Migration**
   - Convert location data to PostGIS
   - Standardize status values
   - Clean up nullable fields

3. **Phase 3: Schema Standardization**
   - Rename primary key columns
   - Fix table names
   - Add ENUM types

4. **Phase 4: Cleanup**
   - Remove deprecated columns
   - Add documentation
   - Update application code

## TypeORM Entity Updates Needed

1. **Add Missing Decorators**
   ```typescript
   @Index(['equipment_type'])
   @Entity('field_equipment')
   export class Equipment {
     @Column('geometry', {
       spatialFeatureType: 'Point',
       srid: 4326
     })
     location: Point;
   }
   ```

2. **Add Validation**
   ```typescript
   @Column({
     type: 'enum',
     enum: EquipmentStatusEnum,
     default: EquipmentStatusEnum.ACTIVE
   })
   status: EquipmentStatusEnum;
   ```

## Frontend Considerations

1. **Type Updates**
   - Update shared types to reflect schema changes
   - Add proper validation for ENUM values
   - Handle nullable fields consistently

2. **Data Handling**
   - Update location handling for PostGIS
   - Add proper timestamp formatting
   - Implement status validation

3. **API Updates**
   - Update query parameters
   - Add proper error handling
   - Implement field validation

## Next Steps

1. Create migration scripts for each phase
2. Update TypeORM entities
3. Update shared types
4. Update frontend components
5. Add tests for new schema
