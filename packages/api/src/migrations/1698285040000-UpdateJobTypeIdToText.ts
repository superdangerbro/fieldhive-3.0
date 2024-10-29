import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateJobTypeIdToText1698285040000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key constraint first
        await queryRunner.query(`
            ALTER TABLE jobs DROP CONSTRAINT IF EXISTS fk_jobs_job_type;
        `);

        // Drop the job_types table with CASCADE
        await queryRunner.query(`
            DROP TABLE IF EXISTS job_types CASCADE;
        `);

        // Alter job_type_id column to text
        await queryRunner.query(`
            ALTER TABLE jobs ALTER COLUMN job_type_id TYPE text;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Convert back to UUID (this will fail if any non-UUID values exist)
        await queryRunner.query(`
            ALTER TABLE jobs ALTER COLUMN job_type_id TYPE uuid USING job_type_id::uuid;
        `);
    }
}
