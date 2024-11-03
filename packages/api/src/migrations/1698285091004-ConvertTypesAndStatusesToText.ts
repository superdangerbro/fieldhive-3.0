import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertTypesAndStatusesToText1698285091004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and convert jobs columns
        const jobsColumns = await queryRunner.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'jobs' AND (column_name = 'status' OR column_name = 'job_type_id')
        `);
        
        for (const column of jobsColumns) {
            if (column.data_type !== 'text') {
                await queryRunner.query(`
                    ALTER TABLE jobs 
                    ALTER COLUMN ${column.column_name} TYPE text
                `);
            }
        }

        // Check and convert field_equipment columns
        const equipmentColumns = await queryRunner.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'field_equipment' AND (column_name = 'status' OR column_name = 'type')
        `);
        
        for (const column of equipmentColumns) {
            if (column.data_type !== 'text') {
                await queryRunner.query(`
                    ALTER TABLE field_equipment 
                    ALTER COLUMN ${column.column_name} TYPE text
                `);
            }
        }

        // Check and convert accounts columns
        const accountsColumns = await queryRunner.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'accounts' AND (column_name = 'status' OR column_name = 'type')
        `);
        
        for (const column of accountsColumns) {
            if (column.data_type !== 'text') {
                await queryRunner.query(`
                    ALTER TABLE accounts 
                    ALTER COLUMN ${column.column_name} TYPE text
                `);
            }
        }

        // Check and convert properties columns
        const propertiesColumns = await queryRunner.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'properties' AND (column_name = 'status' OR column_name = 'property_type')
        `);
        
        for (const column of propertiesColumns) {
            if (column.data_type !== 'text') {
                await queryRunner.query(`
                    ALTER TABLE properties 
                    ALTER COLUMN ${column.column_name} TYPE text
                `);
            }
        }

        // Add unique constraint to settings table if it doesn't exist
        const constraints = await queryRunner.query(`
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = 'settings'
            AND constraint_type = 'UNIQUE'
            AND constraint_name = 'UQ_settings_key'
        `);

        if (!constraints.length) {
            await queryRunner.query(`
                ALTER TABLE settings
                ADD CONSTRAINT UQ_settings_key UNIQUE (key)
            `);
        }

        // Initialize settings for types
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'job_types') THEN
                    INSERT INTO settings (key, value) VALUES ('job_types', '[]'::jsonb);
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'equipment_types') THEN
                    INSERT INTO settings (key, value) VALUES ('equipment_types', '[]'::jsonb);
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'account_types') THEN
                    INSERT INTO settings (key, value) VALUES ('account_types', '[]'::jsonb);
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'property_types') THEN
                    INSERT INTO settings (key, value) VALUES ('property_types', '[]'::jsonb);
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: We don't restore the enum constraints in down migration
        // as it could fail if there are values outside the enum
        await queryRunner.query(`
            -- No need to revert as text type is more permissive than enum
            -- and we want to support dynamic types going forward
        `);
    }
}
