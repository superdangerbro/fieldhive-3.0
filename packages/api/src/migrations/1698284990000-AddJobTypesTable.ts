import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobTypesTable1698284990000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure uuid-ossp extension exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        
        await queryRunner.query(`
            DROP TABLE IF EXISTS job_types CASCADE;
            
            CREATE TABLE job_types (
                job_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT job_types_name_unique UNIQUE (name)
            );

            -- Add default job types
            INSERT INTO job_types (name) VALUES 
                ('Exclusion'),
                ('Pest Control Program'),
                ('Beaver Control')
            ON CONFLICT (name) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS job_types CASCADE;
        `);
    }
}
