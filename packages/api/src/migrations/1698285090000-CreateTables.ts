import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1698285090000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old tables
        await queryRunner.query(`DROP TABLE IF EXISTS field_inspections CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS field_equipment CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS jobs CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS properties_accounts CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS users_accounts CASCADE;`);

        // Create settings table
        await queryRunner.query(`DROP TABLE IF EXISTS settings CASCADE;`);
        await queryRunner.query(`CREATE TABLE settings (id uuid NOT NULL DEFAULT uuid_generate_v4(), key character varying NOT NULL, value jsonb NOT NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id));`);

        // Create addresses table
        await queryRunner.query(`DROP TABLE IF EXISTS addresses CASCADE;`);
        await queryRunner.query(`CREATE TABLE addresses (address_id uuid NOT NULL DEFAULT uuid_generate_v4(), address1 character varying NOT NULL, address2 character varying, city character varying NOT NULL, province character varying NOT NULL, postal_code character varying NOT NULL, country character varying NOT NULL DEFAULT 'Canada', label character varying, created_at timestamptz DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (address_id));`);

        // Add address fields to properties and accounts
        await queryRunner.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS billing_address_id uuid REFERENCES addresses(address_id) ON DELETE SET NULL;`);
        await queryRunner.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS service_address_id uuid REFERENCES addresses(address_id) ON DELETE SET NULL;`);
        await queryRunner.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_address_id uuid REFERENCES addresses(address_id) ON DELETE SET NULL;`);

        // Create indexes for address relationships
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_properties_billing_address ON properties(billing_address_id);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_properties_service_address ON properties(service_address_id);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_accounts_billing_address ON accounts(billing_address_id);`);

        // Create jobs table
        await queryRunner.query(`CREATE TABLE jobs (job_id uuid NOT NULL DEFAULT uuid_generate_v4(), property_id uuid NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE, job_type_id text NOT NULL, status character varying NOT NULL DEFAULT 'pending', notes text, created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (job_id));`);
        await queryRunner.query(`CREATE INDEX idx_jobs_property ON jobs(property_id);`);

        // Create field_equipment table
        await queryRunner.query(`CREATE TABLE field_equipment (equipment_id uuid NOT NULL DEFAULT uuid_generate_v4(), job_id uuid NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE, equipment_type_id text NOT NULL, location geometry(Point, 4326), is_georeferenced boolean DEFAULT true, status text DEFAULT 'active', created_at timestamptz DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (equipment_id));`);
        await queryRunner.query(`CREATE INDEX idx_field_equipment_job ON field_equipment(job_id);`);

        // Create field_inspections table
        await queryRunner.query(`CREATE TABLE field_inspections (inspection_id uuid NOT NULL DEFAULT uuid_generate_v4(), equipment_id uuid NOT NULL REFERENCES field_equipment(equipment_id) ON DELETE CASCADE, inspected_by uuid NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT, status character varying NOT NULL DEFAULT 'pending', barcode character varying, notes character varying, image_url text, created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (inspection_id));`);
        await queryRunner.query(`CREATE INDEX idx_field_inspections_equipment ON field_inspections(equipment_id);`);
        await queryRunner.query(`CREATE INDEX idx_field_inspections_inspector ON field_inspections(inspected_by);`);

        // Create users_accounts M:M relationship
        await queryRunner.query(`CREATE TABLE users_accounts (user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, account_id uuid NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE, role character varying NOT NULL, created_at timestamptz DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, account_id));`);
        await queryRunner.query(`CREATE INDEX idx_users_accounts_user ON users_accounts(user_id);`);
        await queryRunner.query(`CREATE INDEX idx_users_accounts_account ON users_accounts(account_id);`);

        // Create properties_accounts M:M relationship
        await queryRunner.query(`CREATE TABLE properties_accounts (property_id uuid NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE, account_id uuid NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE, created_at timestamptz DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (property_id, account_id));`);
        await queryRunner.query(`CREATE INDEX idx_properties_accounts_property ON properties_accounts(property_id);`);
        await queryRunner.query(`CREATE INDEX idx_properties_accounts_account ON properties_accounts(account_id);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS properties_accounts CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS users_accounts CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS field_inspections CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS field_equipment CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS jobs CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS settings CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS addresses CASCADE;`);

        await queryRunner.query(`ALTER TABLE properties DROP COLUMN IF EXISTS service_address_id;`);
        await queryRunner.query(`ALTER TABLE properties DROP COLUMN IF EXISTS billing_address_id;`);
        await queryRunner.query(`ALTER TABLE accounts DROP COLUMN IF EXISTS billing_address_id;`);
    }
}
