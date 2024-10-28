import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobsTable1698285000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing table if it exists
        await queryRunner.query(`DROP TABLE IF EXISTS jobs CASCADE;`);

        // Create jobs table
        await queryRunner.query(`
            CREATE TABLE jobs (
                job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                job_type_id UUID NOT NULL,
                property_id UUID NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT fk_jobs_job_type FOREIGN KEY (job_type_id) REFERENCES job_types(job_type_id) ON DELETE RESTRICT,
                CONSTRAINT fk_jobs_property FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE RESTRICT
            );
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX idx_jobs_job_type ON jobs(job_type_id);
            CREATE INDEX idx_jobs_property ON jobs(property_id);
            CREATE INDEX idx_jobs_status ON jobs(status);
            CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
        `);

        // Log table structure
        const result = await queryRunner.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'jobs'
            ORDER BY ordinal_position;
        `);
        console.log('Created jobs table with structure:', result);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS jobs CASCADE;`);
    }
}
