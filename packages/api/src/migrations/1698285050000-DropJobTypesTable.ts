import { MigrationInterface, QueryRunner } from "typeorm";

export class DropJobTypesTable1698285050000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS job_types CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate job_types table if needed to rollback
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS job_types (
                job_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
}
