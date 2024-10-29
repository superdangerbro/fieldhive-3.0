import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSettingsTable1698285030000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                key VARCHAR(255) UNIQUE NOT NULL,
                value JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add default equipment types
        await queryRunner.query(`
            INSERT INTO settings (key, value)
            VALUES (
                'equipment_types',
                '[
                    {
                        "name": "Large Rodent Station",
                        "fields": []
                    },
                    {
                        "name": "Small Rodent Station",
                        "fields": []
                    },
                    {
                        "name": "Beaver Trap",
                        "fields": []
                    }
                ]'::jsonb
            )
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS settings`);
    }
}
