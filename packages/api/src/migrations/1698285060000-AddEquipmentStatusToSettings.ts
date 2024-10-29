import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEquipmentStatusToSettings1698285060000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add default equipment statuses to settings
        await queryRunner.query(`
            INSERT INTO settings (key, value)
            VALUES ('equipment_status', '["Active", "Inactive", "Under Maintenance", "Retired"]')
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value;
        `);

        // Update existing field_equipment table to use text for status
        await queryRunner.query(`
            ALTER TABLE field_equipment 
            ALTER COLUMN status TYPE text;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove equipment status from settings
        await queryRunner.query(`
            DELETE FROM settings WHERE key = 'equipment_status';
        `);

        // Convert status back to enum if needed
        await queryRunner.query(`
            ALTER TABLE field_equipment 
            ALTER COLUMN status TYPE varchar(255);
        `);
    }
}
