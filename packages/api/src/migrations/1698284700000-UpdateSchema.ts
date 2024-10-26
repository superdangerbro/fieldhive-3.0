import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1698284700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if migrations table exists and create if not
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                timestamp bigint NOT NULL,
                name character varying NOT NULL
            );
        `);

        // Check if typeorm_metadata table exists and create if not
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS typeorm_metadata (
                type varchar NOT NULL,
                schema varchar,
                name varchar,
                value text
            );
        `);

        // 1. Fix table name with spaces (if it exists)
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'beaver trap types'
                ) THEN
                    ALTER TABLE "beaver trap types" 
                    RENAME TO beaver_trap_types;
                END IF;
            END $$;
        `);

        // 2. Add missing foreign key constraints (if they don't exist)
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'fk_field_equipment_type'
                ) THEN
                    ALTER TABLE field_equipment
                    ADD CONSTRAINT fk_field_equipment_type
                    FOREIGN KEY (equipment_type) 
                    REFERENCES equipment_types(equipment_type_id);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'fk_field_equipment_job'
                ) THEN
                    ALTER TABLE field_equipment
                    ADD CONSTRAINT fk_field_equipment_job
                    FOREIGN KEY ("jobId") 
                    REFERENCES jobs(job_id);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'fk_equipment_inspections_equipment'
                ) THEN
                    ALTER TABLE equipment_inspections
                    ADD CONSTRAINT fk_equipment_inspections_equipment
                    FOREIGN KEY (equipment_id) 
                    REFERENCES field_equipment(equipment_id);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'fk_equipment_inspections_inspector'
                ) THEN
                    ALTER TABLE equipment_inspections
                    ADD CONSTRAINT fk_equipment_inspections_inspector
                    FOREIGN KEY (inspected_by) 
                    REFERENCES users(user_id);
                END IF;
            END $$;
        `);

        // 3. Migrate existing lat/long data to PostGIS point
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

        // 4. Add indexes for frequently queried fields
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = 'idx_equipment_type_name'
                ) THEN
                    CREATE INDEX idx_equipment_type_name 
                    ON equipment_types(equipment_type);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = 'idx_field_equipment_created'
                ) THEN
                    CREATE INDEX idx_field_equipment_created 
                    ON field_equipment(created_at);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = 'idx_equipment_inspections_created'
                ) THEN
                    CREATE INDEX idx_equipment_inspections_created 
                    ON equipment_inspections(created_at);
                END IF;
            END $$;
        `);

        // Log the migration
        await queryRunner.query(`
            INSERT INTO typeorm_metadata(type, schema, name, value)
            VALUES (
                'MIGRATION_LOG',
                'public',
                'UpdateSchema1698284700000',
                'Updated schema: fixed table names, added constraints and indexes, migrated geo data'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Revert table rename (if it exists)
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'beaver_trap_types'
                ) THEN
                    ALTER TABLE beaver_trap_types 
                    RENAME TO "beaver trap types";
                END IF;
            END $$;
        `);

        // 2. Remove foreign key constraints
        await queryRunner.query(`
            ALTER TABLE field_equipment
            DROP CONSTRAINT IF EXISTS fk_field_equipment_type;

            ALTER TABLE field_equipment
            DROP CONSTRAINT IF EXISTS fk_field_equipment_job;

            ALTER TABLE equipment_inspections
            DROP CONSTRAINT IF EXISTS fk_equipment_inspections_equipment;

            ALTER TABLE equipment_inspections
            DROP CONSTRAINT IF EXISTS fk_equipment_inspections_inspector;
        `);

        // 3. Remove indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_equipment_type_name;
            DROP INDEX IF EXISTS idx_field_equipment_created;
            DROP INDEX IF EXISTS idx_equipment_inspections_created;
        `);

        // Remove migration log
        await queryRunner.query(`
            DELETE FROM typeorm_metadata 
            WHERE name = 'UpdateSchema1698284700000';
        `);
    }
}
