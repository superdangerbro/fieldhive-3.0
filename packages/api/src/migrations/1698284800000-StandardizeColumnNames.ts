import { MigrationInterface, QueryRunner } from "typeorm";

export class StandardizeColumnNames1698284800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Standardize column names in field_equipment
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Rename jobId to job_id if it exists
                IF EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'field_equipment' 
                    AND column_name = 'jobId'
                ) THEN
                    ALTER TABLE field_equipment 
                    RENAME COLUMN "jobId" TO job_id;
                END IF;
            END $$;
        `);

        // Add foreign key constraints with standardized names
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Equipment type foreign key
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'fk_field_equipment_type'
                ) THEN
                    ALTER TABLE field_equipment
                    ADD CONSTRAINT fk_field_equipment_type
                    FOREIGN KEY (equipment_type) 
                    REFERENCES equipment_types(equipment_type_id);
                END IF;

                -- Job foreign key
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'fk_field_equipment_job'
                ) THEN
                    ALTER TABLE field_equipment
                    ADD CONSTRAINT fk_field_equipment_job
                    FOREIGN KEY (job_id) 
                    REFERENCES jobs(job_id);
                END IF;

                -- Equipment inspection foreign keys
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

        // Add indexes for performance
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = 'idx_field_equipment_job'
                ) THEN
                    CREATE INDEX idx_field_equipment_job 
                    ON field_equipment(job_id);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = 'idx_field_equipment_type'
                ) THEN
                    CREATE INDEX idx_field_equipment_type 
                    ON field_equipment(equipment_type);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = 'idx_equipment_inspections_equipment'
                ) THEN
                    CREATE INDEX idx_equipment_inspections_equipment 
                    ON equipment_inspections(equipment_id);
                END IF;
            END $$;
        `);

        // Log the migration
        await queryRunner.query(`
            INSERT INTO typeorm_metadata(type, schema, name, value)
            VALUES (
                'MIGRATION_LOG',
                'public',
                'StandardizeColumnNames1698284800000',
                'Standardized column names and added constraints'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert column names
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Rename job_id back to jobId if it exists
                IF EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'field_equipment' 
                    AND column_name = 'job_id'
                ) THEN
                    ALTER TABLE field_equipment 
                    RENAME COLUMN job_id TO "jobId";
                END IF;
            END $$;
        `);

        // Remove foreign key constraints
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

        // Remove indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_field_equipment_job;
            DROP INDEX IF EXISTS idx_field_equipment_type;
            DROP INDEX IF EXISTS idx_equipment_inspections_equipment;
        `);

        // Remove migration log
        await queryRunner.query(`
            DELETE FROM typeorm_metadata 
            WHERE name = 'StandardizeColumnNames1698284800000';
        `);
    }
}
