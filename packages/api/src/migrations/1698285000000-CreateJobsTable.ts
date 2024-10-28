import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobsTable1698285000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure uuid-ossp extension exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        // Drop existing table if it exists
        await queryRunner.query(`DROP TABLE IF EXISTS jobs CASCADE;`);

        // Create jobs table with proper constraints
        await queryRunner.query(`
            CREATE TABLE jobs (
                job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                job_type_id UUID NOT NULL,
                property_id UUID NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT fk_jobs_job_type 
                    FOREIGN KEY (job_type_id) 
                    REFERENCES job_types(job_type_id) 
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE,
                CONSTRAINT fk_jobs_property 
                    FOREIGN KEY (property_id) 
                    REFERENCES properties(property_id) 
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE
            );

            -- Create indexes for performance
            CREATE INDEX idx_jobs_job_type ON jobs(job_type_id);
            CREATE INDEX idx_jobs_property ON jobs(property_id);
            CREATE INDEX idx_jobs_status ON jobs(status);
            CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

            -- Create trigger for updated_at
            CREATE OR REPLACE FUNCTION update_jobs_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER jobs_updated_at
                BEFORE UPDATE ON jobs
                FOR EACH ROW
                EXECUTE FUNCTION update_jobs_updated_at();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
            DROP FUNCTION IF EXISTS update_jobs_updated_at();
            DROP TABLE IF EXISTS jobs CASCADE;
        `);
    }
}
