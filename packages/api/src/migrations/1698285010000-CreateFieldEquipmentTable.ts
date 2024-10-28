import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFieldEquipmentTable1698285010000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create equipment_types table if it doesn't exist
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS equipment_types (
                equipment_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR NOT NULL UNIQUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // Create field_equipment table
        await queryRunner.query(`
            CREATE TABLE field_equipment (
                equipment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                job_id UUID NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
                equipment_type_id UUID NOT NULL REFERENCES equipment_types(equipment_type_id),
                location GEOMETRY(Point, 4326),
                is_georeferenced BOOLEAN DEFAULT true,
                status VARCHAR DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // Create spatial index on location
        await queryRunner.query(`
            CREATE INDEX idx_field_equipment_location 
            ON field_equipment USING GIST (location);
        `);

        // Create indexes for foreign keys
        await queryRunner.query(`
            CREATE INDEX idx_field_equipment_job 
            ON field_equipment(job_id);

            CREATE INDEX idx_field_equipment_type 
            ON field_equipment(equipment_type_id);
        `);

        // Insert default equipment types if they don't exist
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Insert Trap if it doesn't exist
                IF NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Trap') THEN
                    INSERT INTO equipment_types (name) VALUES ('Trap');
                END IF;

                -- Insert Bait Station if it doesn't exist
                IF NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Bait Station') THEN
                    INSERT INTO equipment_types (name) VALUES ('Bait Station');
                END IF;

                -- Insert Sensor if it doesn't exist
                IF NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Sensor') THEN
                    INSERT INTO equipment_types (name) VALUES ('Sensor');
                END IF;
            END $$;
        `);

        // Log the migration
        await queryRunner.query(`
            INSERT INTO typeorm_metadata(type, schema, name, value)
            VALUES (
                'MIGRATION_LOG',
                'public',
                'CreateFieldEquipmentTable1698285010000',
                'Created field_equipment table and related tables'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_field_equipment_location;
            DROP INDEX IF EXISTS idx_field_equipment_job;
            DROP INDEX IF EXISTS idx_field_equipment_type;
        `);

        // Drop field_equipment table
        await queryRunner.query(`
            DROP TABLE IF EXISTS field_equipment;
        `);

        // Drop equipment_types table
        await queryRunner.query(`
            DROP TABLE IF EXISTS equipment_types;
        `);

        // Remove migration log
        await queryRunner.query(`
            DELETE FROM typeorm_metadata 
            WHERE name = 'CreateFieldEquipmentTable1698285010000';
        `);
    }
}
