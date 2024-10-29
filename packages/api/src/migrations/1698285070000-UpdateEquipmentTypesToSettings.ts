import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEquipmentTypesToSettings1698285070000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get existing equipment types
        const equipmentTypes = await queryRunner.query(`
            SELECT * FROM equipment_types;
        `);

        // Store equipment types in settings
        await queryRunner.query(`
            INSERT INTO settings (key, value)
            VALUES ('equipment_types', $1)
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value;
        `, [JSON.stringify(equipmentTypes.map((type: any) => ({
            name: type.name,
            fields: type.fields || []
        })))]);

        // Drop all foreign key constraints on equipment_type_id
        await queryRunner.query(`
            DO $$ 
            BEGIN
                EXECUTE (
                    SELECT 'ALTER TABLE field_equipment DROP CONSTRAINT ' || quote_ident(conname)
                    FROM pg_constraint
                    WHERE conrelid = 'field_equipment'::regclass
                    AND conname LIKE '%equipment_type_id%'
                );
            END $$;
        `);

        // Update field_equipment table to use text for equipment_type_id
        await queryRunner.query(`
            ALTER TABLE field_equipment
            ALTER COLUMN equipment_type_id TYPE text;
        `);

        // Update existing records to use the name as the ID
        for (const type of equipmentTypes) {
            await queryRunner.query(`
                UPDATE field_equipment
                SET equipment_type_id = $1
                WHERE equipment_type_id = $2;
            `, [type.name, type.equipment_type_id]);
        }

        // Drop the equipment_types table
        await queryRunner.query(`
            DROP TABLE IF EXISTS equipment_types CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate equipment_types table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS equipment_types (
                equipment_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                fields JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Get equipment types from settings
        const [setting] = await queryRunner.query(`
            SELECT value FROM settings WHERE key = 'equipment_types';
        `);

        if (setting) {
            const types = JSON.parse(setting.value);
            
            // Insert types back into equipment_types table
            for (const type of types) {
                const [result] = await queryRunner.query(`
                    INSERT INTO equipment_types (name, fields)
                    VALUES ($1, $2)
                    RETURNING equipment_type_id;
                `, [type.name, JSON.stringify(type.fields)]);

                // Update field_equipment references
                await queryRunner.query(`
                    UPDATE field_equipment
                    SET equipment_type_id = $1
                    WHERE equipment_type_id = $2;
                `, [result.equipment_type_id, type.name]);
            }
        }

        // Alter field_equipment table back to UUID
        await queryRunner.query(`
            ALTER TABLE field_equipment
            ALTER COLUMN equipment_type_id TYPE UUID USING equipment_type_id::uuid;
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE field_equipment
            ADD CONSTRAINT fk_field_equipment_type
            FOREIGN KEY (equipment_type_id)
            REFERENCES equipment_types(equipment_type_id);
        `);

        // Remove equipment types from settings
        await queryRunner.query(`
            DELETE FROM settings WHERE key = 'equipment_types';
        `);
    }
}
