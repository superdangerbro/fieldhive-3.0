import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInspectionSystem1704533957000 implements MigrationInterface {
    name = 'AddInspectionSystem1704533957000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to equipment_inspections
        await queryRunner.query(`
            ALTER TABLE "equipment_inspections"
            ADD COLUMN IF NOT EXISTS "data" JSONB,
            ADD COLUMN IF NOT EXISTS "job_id" UUID,
            ADD COLUMN IF NOT EXISTS "location" POINT,
            ADD COLUMN IF NOT EXISTS "property_id" UUID
        `);

        // Create inspection_jobs table
        await queryRunner.query(`
            CREATE TABLE "inspection_jobs" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "property_id" UUID NOT NULL,
                "technician_id" UUID NOT NULL,
                "scheduled_date" TIMESTAMP WITH TIME ZONE,
                "status" TEXT NOT NULL DEFAULT 'pending',
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "valid_status" CHECK (status IN ('pending', 'in_progress', 'completed')),
                CONSTRAINT "fk_inspection_jobs_property" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE,
                CONSTRAINT "fk_inspection_jobs_technician" FOREIGN KEY ("technician_id") REFERENCES "users"("user_id") ON DELETE CASCADE
            )
        `);

        // Create inspection_job_equipment table
        await queryRunner.query(`
            CREATE TABLE "inspection_job_equipment" (
                "job_id" UUID NOT NULL,
                "equipment_id" UUID NOT NULL,
                "inspection_id" UUID,
                "status" TEXT NOT NULL DEFAULT 'pending',
                "sequence_number" INTEGER NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "pk_inspection_job_equipment" PRIMARY KEY ("job_id", "equipment_id"),
                CONSTRAINT "valid_status" CHECK (status IN ('pending', 'completed')),
                CONSTRAINT "fk_inspection_job_equipment_job" FOREIGN KEY ("job_id") REFERENCES "inspection_jobs"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_inspection_job_equipment_equipment" FOREIGN KEY ("equipment_id") REFERENCES "field_equipment"("equipment_id") ON DELETE CASCADE,
                CONSTRAINT "fk_inspection_job_equipment_inspection" FOREIGN KEY ("inspection_id") REFERENCES "equipment_inspections"("inspection_id") ON DELETE SET NULL
            )
        `);

        // Add foreign key constraints to equipment_inspections
        await queryRunner.query(`
            ALTER TABLE "equipment_inspections"
            ADD CONSTRAINT "fk_equipment_inspections_job" FOREIGN KEY ("job_id") REFERENCES "inspection_jobs"("id") ON DELETE SET NULL,
            ADD CONSTRAINT "fk_equipment_inspections_property" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE SET NULL
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_equipment_inspections_job_id" ON "equipment_inspections"("job_id")`);
        await queryRunner.query(`CREATE INDEX "idx_equipment_inspections_property_id" ON "equipment_inspections"("property_id")`);
        await queryRunner.query(`CREATE INDEX "idx_inspection_jobs_property_id" ON "inspection_jobs"("property_id")`);
        await queryRunner.query(`CREATE INDEX "idx_inspection_jobs_technician_id" ON "inspection_jobs"("technician_id")`);
        await queryRunner.query(`CREATE INDEX "idx_inspection_job_equipment_job_id" ON "inspection_job_equipment"("job_id")`);
        await queryRunner.query(`CREATE INDEX "idx_inspection_job_equipment_equipment_id" ON "inspection_job_equipment"("equipment_id")`);
        await queryRunner.query(`CREATE INDEX "idx_inspection_job_equipment_inspection_id" ON "inspection_job_equipment"("inspection_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_job_equipment_inspection_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_job_equipment_equipment_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_job_equipment_job_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_jobs_technician_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_jobs_property_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_inspections_property_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_equipment_inspections_job_id"`);

        // Drop foreign key constraints from equipment_inspections
        await queryRunner.query(`
            ALTER TABLE "equipment_inspections"
            DROP CONSTRAINT IF EXISTS "fk_equipment_inspections_job",
            DROP CONSTRAINT IF EXISTS "fk_equipment_inspections_property"
        `);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "inspection_job_equipment"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "inspection_jobs"`);

        // Drop columns from equipment_inspections
        await queryRunner.query(`
            ALTER TABLE "equipment_inspections"
            DROP COLUMN IF EXISTS "data",
            DROP COLUMN IF EXISTS "job_id",
            DROP COLUMN IF EXISTS "location",
            DROP COLUMN IF EXISTS "property_id"
        `);
    }
}
