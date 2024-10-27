import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAccountsAndProperties1698284920000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop circular dependencies first
        await queryRunner.query(`
            ALTER TABLE properties 
            DROP CONSTRAINT IF EXISTS fk_properties_billing_address,
            DROP CONSTRAINT IF EXISTS fk_properties_service_address,
            DROP CONSTRAINT IF EXISTS fk_properties_accounts;
        `);

        // Drop duplicate columns in properties
        await queryRunner.query(`
            ALTER TABLE properties 
            DROP COLUMN IF EXISTS billing_address,
            DROP COLUMN IF EXISTS service_address,
            DROP COLUMN IF EXISTS accounts;
        `);

        // Add missing columns to properties
        await queryRunner.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL,
            ADD COLUMN IF NOT EXISTS address VARCHAR(255) NOT NULL,
            ADD COLUMN IF NOT EXISTS location GEOMETRY(Point, 4326),
            ADD COLUMN IF NOT EXISTS boundary GEOMETRY(Polygon, 4326);
        `);

        // Fix properties_accounts_join table
        await queryRunner.query(`
            DROP TABLE IF EXISTS properties_accounts_join;
            CREATE TABLE properties_accounts_join (
                property_id UUID REFERENCES properties(property_id) ON DELETE CASCADE,
                account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (property_id, account_id)
            );
        `);

        // Create users_accounts_join table for M:M relationship
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users_accounts_join (
                user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, account_id)
            );
        `);

        // Add indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST(location);
            CREATE INDEX IF NOT EXISTS idx_properties_boundary ON properties USING GIST(boundary);
            CREATE INDEX IF NOT EXISTS idx_properties_accounts_join_property ON properties_accounts_join(property_id);
            CREATE INDEX IF NOT EXISTS idx_properties_accounts_join_account ON properties_accounts_join(account_id);
            CREATE INDEX IF NOT EXISTS idx_users_accounts_join_user ON users_accounts_join(user_id);
            CREATE INDEX IF NOT EXISTS idx_users_accounts_join_account ON users_accounts_join(account_id);
        `);

        // Add updated_at triggers
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            DROP TRIGGER IF EXISTS update_properties_accounts_join_updated_at ON properties_accounts_join;
            CREATE TRIGGER update_properties_accounts_join_updated_at
                BEFORE UPDATE ON properties_accounts_join
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS update_users_accounts_join_updated_at ON users_accounts_join;
            CREATE TRIGGER update_users_accounts_join_updated_at
                BEFORE UPDATE ON users_accounts_join
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove triggers
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_properties_accounts_join_updated_at ON properties_accounts_join;
            DROP TRIGGER IF EXISTS update_users_accounts_join_updated_at ON users_accounts_join;
        `);

        // Remove indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_properties_location;
            DROP INDEX IF EXISTS idx_properties_boundary;
            DROP INDEX IF EXISTS idx_properties_accounts_join_property;
            DROP INDEX IF EXISTS idx_properties_accounts_join_account;
            DROP INDEX IF EXISTS idx_users_accounts_join_user;
            DROP INDEX IF EXISTS idx_users_accounts_join_account;
        `);

        // Drop new tables
        await queryRunner.query(`
            DROP TABLE IF EXISTS users_accounts_join;
            DROP TABLE IF EXISTS properties_accounts_join;
        `);

        // Revert property columns
        await queryRunner.query(`
            ALTER TABLE properties 
            DROP COLUMN IF EXISTS name,
            DROP COLUMN IF EXISTS address,
            DROP COLUMN IF EXISTS location,
            DROP COLUMN IF EXISTS boundary,
            ADD COLUMN billing_address UUID,
            ADD COLUMN service_address UUID,
            ADD COLUMN accounts UUID;
        `);
    }
}
