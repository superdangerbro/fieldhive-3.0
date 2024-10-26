import { MigrationInterface, QueryRunner } from "typeorm";

export class CompleteGeoMigration1698284900000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Migrate any remaining lat/long data to PostGIS points
        await queryRunner.query(`
            UPDATE field_equipment 
            SET location = ST_SetSRID(ST_MakePoint(
                CAST(longitude AS float), 
                CAST(latitude AS float)
            ), 4326)
            WHERE longitude IS NOT NULL 
            AND latitude IS NOT NULL 
            AND location IS NULL;
        `);

        // 2. Verify migration
        await queryRunner.query(`
            DO $$
            DECLARE
                unmigrated_count integer;
            BEGIN
                SELECT COUNT(*) INTO unmigrated_count
                FROM field_equipment
                WHERE location IS NULL 
                AND (longitude IS NOT NULL OR latitude IS NOT NULL);

                IF unmigrated_count > 0 THEN
                    RAISE EXCEPTION 'Migration incomplete: % records still have unmigrated coordinates', unmigrated_count;
                END IF;
            END $$;
        `);

        // 3. Add NOT NULL constraint to location for georeferenced equipment
        await queryRunner.query(`
            ALTER TABLE field_equipment
            ADD CONSTRAINT check_georeferenced_location
            CHECK (
                (is_georeferenced = false) OR 
                (is_georeferenced = true AND location IS NOT NULL)
            );
        `);

        // 4. Create spatial index
        await queryRunner.query(`
            CREATE INDEX idx_field_equipment_location 
            ON field_equipment USING GIST (location);
        `);

        // 5. Drop deprecated columns
        await queryRunner.query(`
            ALTER TABLE field_equipment
            DROP COLUMN longitude,
            DROP COLUMN latitude;
        `);

        // Log the migration
        await queryRunner.query(`
            INSERT INTO typeorm_metadata(type, schema, name, value)
            VALUES (
                'MIGRATION_LOG',
                'public',
                'CompleteGeoMigration1698284900000',
                'Completed migration to PostGIS and removed deprecated columns'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Add back the deprecated columns
        await queryRunner.query(`
            ALTER TABLE field_equipment
            ADD COLUMN longitude numeric,
            ADD COLUMN latitude numeric;
        `);

        // 2. Migrate data back to lat/long
        await queryRunner.query(`
            UPDATE field_equipment 
            SET 
                longitude = ST_X(location::geometry),
                latitude = ST_Y(location::geometry)
            WHERE location IS NOT NULL;
        `);

        // 3. Remove spatial index
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_field_equipment_location;
        `);

        // 4. Remove location constraint
        await queryRunner.query(`
            ALTER TABLE field_equipment
            DROP CONSTRAINT IF EXISTS check_georeferenced_location;
        `);

        // Remove migration log
        await queryRunner.query(`
            DELETE FROM typeorm_metadata 
            WHERE name = 'CompleteGeoMigration1698284900000';
        `);
    }
}

/*
This migration:
1. Completes the migration of lat/long data to PostGIS points
2. Verifies that all coordinates were migrated successfully
3. Adds a constraint ensuring georeferenced equipment has location data
4. Creates a spatial index for efficient geo-queries
5. Removes the deprecated lat/long columns

The down migration:
1. Adds back the lat/long columns
2. Migrates PostGIS points back to lat/long
3. Removes the spatial index and constraints

Note: This migration includes a verification step that will fail if any
coordinates haven't been properly migrated, ensuring data integrity.
*/
