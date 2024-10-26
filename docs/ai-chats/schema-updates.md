# Schema Updates and Standardization

Date: October 25, 2023

## Current Schema State

### Core Tables

1. **Equipment Types**
   ```sql
   equipment_types (
     equipment_type_id uuid PRIMARY KEY,
     equipment_type varchar,
     description varchar(500),
     created_at timestamp,
     updated_at timestamp
   )
   ```

2. **Field Equipment**
   ```sql
   field_equipment (
     equipment_id uuid PRIMARY KEY,
     equipment_type uuid REFERENCES equipment_types(equipment_type_id),
     job_id uuid REFERENCES jobs(job_id),
     is_georeferenced boolean,
     notes varchar,
     location geometry(Point, 4326),
     longitude numeric,  -- Deprecated, kept for migration
     latitude numeric,  -- Deprecated, kept for migration
     created_at timestamp,
     updated_at timestamp
   )
   ```

3. **Equipment Inspections**
   ```sql
   equipment_inspections (
     inspection_id uuid PRIMARY KEY,
     equipment_id uuid REFERENCES field_equipment(equipment_id),
     status equipment_status_enum,
     notes varchar,
     inspected_by uuid REFERENCES users(user_id),
     barcode varchar,
     image_url text,
     created_at timestamp,
     updated_at timestamp
   )
   ```

### Completed Schema Improvements

1. **Table Name Standardization**
   - Renamed "beaver trap types" to "beaver_trap_types"
   - All table names now use snake_case

2. **Column Name Standardization**
   - Renamed "jobId" to "job_id" in field_equipment
   - All column names now use snake_case

3. **Foreign Key Constraints**
   - Added `fk_field_equipment_type`
   - Added `fk_field_equipment_job`
   - Added `fk_equipment_inspections_equipment`
   - Added `fk_equipment_inspections_inspector`

4. **Indexes for Performance**
   - Added `idx_field_equipment_job`
   - Added `idx_field_equipment_type`
   - Added `idx_equipment_inspections_equipment`

5. **PostGIS Integration**
   - Added geometry column for locations
   - Set up for migration from lat/long to PostGIS points

6. **Enum Types**
   - Created `equipment_status_enum` for standardized status values
   - Applied to both inspections and status tables

### Migration History

1. Initial Schema Setup
   - Basic table structure
   - Core relationships

2. Schema Standardization
   - Fixed table names
   - Standardized column names
   - Added foreign key constraints

3. Performance Optimization
   - Added strategic indexes
   - Set up PostGIS for geospatial queries

### Next Steps

1. **Data Migration**
   - Complete migration of lat/long to PostGIS points
   - Validate spatial data integrity

2. **Schema Cleanup**
   - Remove deprecated columns after data migration
   - Add additional validation constraints

3. **Performance Monitoring**
   - Monitor index usage
   - Optimize query patterns

4. **Documentation**
   - Update API documentation
   - Document query patterns
   - Add spatial query examples

## Best Practices Implemented

1. **Naming Conventions**
   - Snake_case for all database objects
   - Descriptive foreign key names
   - Consistent primary key naming

2. **Data Integrity**
   - Foreign key constraints
   - NOT NULL constraints where appropriate
   - Enum types for fixed values

3. **Performance**
   - Strategic indexes
   - PostGIS for spatial queries
   - Timestamp tracking

4. **Maintainability**
   - Clear migration history
   - Documented schema changes
   - Reversible migrations
