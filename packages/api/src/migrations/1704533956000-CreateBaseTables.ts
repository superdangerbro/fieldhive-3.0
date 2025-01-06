import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBaseTables1704533956000 implements MigrationInterface {
    name = 'CreateBaseTables1704533956000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if tables exist
        const usersExists = await queryRunner.hasTable("users");
        const propertiesExists = await queryRunner.hasTable("properties");
        const addressesExists = await queryRunner.hasTable("addresses");
        const jobsExists = await queryRunner.hasTable("jobs");
        const fieldEquipmentExists = await queryRunner.hasTable("field_equipment");
        const equipmentInspectionsExists = await queryRunner.hasTable("equipment_inspections");

        // Create users table if it doesn't exist
        if (!usersExists) {
            await queryRunner.query(`
                CREATE TABLE "users" (
                    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "email" TEXT NOT NULL UNIQUE,
                    "first_name" TEXT,
                    "last_name" TEXT,
                    "role" TEXT NOT NULL DEFAULT 'user',
                    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "valid_role" CHECK (role IN ('admin', 'user', 'technician'))
                )
            `);
        }

        // Create properties table if it doesn't exist
        if (!propertiesExists) {
            await queryRunner.query(`
                CREATE TABLE "properties" (
                    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "name" TEXT NOT NULL,
                    "description" TEXT,
                    "location" POINT,
                    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }

        // Create addresses table if it doesn't exist
        if (!addressesExists) {
            await queryRunner.query(`
                CREATE TABLE "addresses" (
                    "address_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "street_address" TEXT NOT NULL,
                    "city" TEXT NOT NULL,
                    "state" TEXT NOT NULL,
                    "zip_code" TEXT NOT NULL,
                    "country" TEXT NOT NULL DEFAULT 'USA',
                    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }

        // Create jobs table if it doesn't exist
        if (!jobsExists) {
            await queryRunner.query(`
                CREATE TABLE "jobs" (
                    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "property_id" UUID NOT NULL,
                    "technician_id" UUID,
                    "status" TEXT NOT NULL DEFAULT 'pending',
                    "scheduled_date" TIMESTAMP WITH TIME ZONE,
                    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "valid_status" CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
                    CONSTRAINT "fk_jobs_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE,
                    CONSTRAINT "fk_jobs_technician" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE SET NULL
                )
            `);
        }

        // Create field_equipment table if it doesn't exist
        if (!fieldEquipmentExists) {
            await queryRunner.query(`
                CREATE TABLE "field_equipment" (
                    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "property_id" UUID NOT NULL,
                    "name" TEXT NOT NULL,
                    "type" TEXT NOT NULL,
                    "model" TEXT,
                    "serial_number" TEXT,
                    "location" POINT,
                    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "fk_field_equipment_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
                )
            `);
        }

        // Create equipment_inspections table if it doesn't exist
        if (!equipmentInspectionsExists) {
            await queryRunner.query(`
                CREATE TABLE "equipment_inspections" (
                    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "equipment_id" UUID NOT NULL,
                    "inspector_id" UUID NOT NULL,
                    "inspection_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "notes" TEXT,
                    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "fk_equipment_inspections_equipment" FOREIGN KEY ("equipment_id") REFERENCES "field_equipment"("id") ON DELETE CASCADE,
                    CONSTRAINT "fk_equipment_inspections_inspector" FOREIGN KEY ("inspector_id") REFERENCES "users"("id") ON DELETE CASCADE
                )
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No need to drop tables in down migration since we only create them if they don't exist
    }
}
