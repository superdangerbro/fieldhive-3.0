import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanupTablesAndAddStatus1698284930000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add status to properties
        await queryRunner.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
        `);

        // Fix properties_accounts_join table (remove duplicate columns)
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

        // Fix accounts_contacts_join table (remove duplicate columns)
        await queryRunner.query(`
            DROP TABLE IF EXISTS accounts_contacts_join;
            CREATE TABLE accounts_contacts_join (
                account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
                contact_id UUID REFERENCES contacts(contact_id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (account_id, contact_id)
            );
        `);

        // Drop billing_address and service_address tables since address is now in properties
        await queryRunner.query(`
            DROP TABLE IF EXISTS billing_address;
            DROP TABLE IF EXISTS service_address;
        `);

        // Add indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
            CREATE INDEX IF NOT EXISTS idx_properties_accounts_join_property ON properties_accounts_join(property_id);
            CREATE INDEX IF NOT EXISTS idx_properties_accounts_join_account ON properties_accounts_join(account_id);
            CREATE INDEX IF NOT EXISTS idx_accounts_contacts_join_account ON accounts_contacts_join(account_id);
            CREATE INDEX IF NOT EXISTS idx_accounts_contacts_join_contact ON accounts_contacts_join(contact_id);
        `);

        // Add updated_at triggers
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_properties_accounts_join_updated_at ON properties_accounts_join;
            CREATE TRIGGER update_properties_accounts_join_updated_at
                BEFORE UPDATE ON properties_accounts_join
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS update_accounts_contacts_join_updated_at ON accounts_contacts_join;
            CREATE TRIGGER update_accounts_contacts_join_updated_at
                BEFORE UPDATE ON accounts_contacts_join
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove triggers
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_properties_accounts_join_updated_at ON properties_accounts_join;
            DROP TRIGGER IF EXISTS update_accounts_contacts_join_updated_at ON accounts_contacts_join;
        `);

        // Remove indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_properties_status;
            DROP INDEX IF EXISTS idx_properties_accounts_join_property;
            DROP INDEX IF EXISTS idx_properties_accounts_join_account;
            DROP INDEX IF EXISTS idx_accounts_contacts_join_account;
            DROP INDEX IF EXISTS idx_accounts_contacts_join_contact;
        `);

        // Remove status from properties
        await queryRunner.query(`
            ALTER TABLE properties 
            DROP COLUMN IF EXISTS status;
        `);

        // Recreate billing_address and service_address tables
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS billing_address (
                billing_address_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                account_id UUID NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
                property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
                address_1 VARCHAR(255),
                address_2 VARCHAR(255),
                postal_code VARCHAR(255),
                city VARCHAR(255),
                province VARCHAR(255),
                country VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS service_address (
                service_address_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                account_id UUID NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
                property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
                address_1 VARCHAR(255),
                address_2 VARCHAR(255),
                postal_code VARCHAR(255),
                city VARCHAR(255),
                province VARCHAR(255),
                country VARCHAR(255)
            );
        `);
    }
}
