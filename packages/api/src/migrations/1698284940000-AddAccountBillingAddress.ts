import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountBillingAddress1698284940000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add status to accounts
        await queryRunner.query(`
            ALTER TABLE accounts 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
        `);

        // Create account_billing_address table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS account_billing_address (
                address_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                account_id UUID NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
                address_1 VARCHAR(255) NOT NULL,
                address_2 VARCHAR(255),
                city VARCHAR(100) NOT NULL,
                province VARCHAR(100) NOT NULL,
                postal_code VARCHAR(20) NOT NULL,
                country VARCHAR(100) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(account_id)
            );
        `);

        // Create property_billing_address table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS property_billing_address (
                address_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
                use_account_billing BOOLEAN DEFAULT false,
                account_id UUID REFERENCES accounts(account_id),
                address_1 VARCHAR(255),
                address_2 VARCHAR(255),
                city VARCHAR(100),
                province VARCHAR(100),
                postal_code VARCHAR(20),
                country VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(property_id),
                CONSTRAINT check_billing_source 
                    CHECK (
                        (use_account_billing = true AND account_id IS NOT NULL AND 
                         address_1 IS NULL AND city IS NULL AND province IS NULL AND 
                         postal_code IS NULL AND country IS NULL)
                        OR
                        (use_account_billing = false AND account_id IS NULL AND 
                         address_1 IS NOT NULL AND city IS NOT NULL AND 
                         province IS NOT NULL AND postal_code IS NOT NULL AND 
                         country IS NOT NULL)
                    )
            );
        `);

        // Add updated_at triggers
        await queryRunner.query(`
            CREATE TRIGGER update_account_billing_address_updated_at
                BEFORE UPDATE ON account_billing_address
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_property_billing_address_updated_at
                BEFORE UPDATE ON property_billing_address
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        // Add indexes
        await queryRunner.query(`
            CREATE INDEX idx_accounts_status ON accounts(status);
            CREATE INDEX idx_account_billing_address_account ON account_billing_address(account_id);
            CREATE INDEX idx_property_billing_address_property ON property_billing_address(property_id);
            CREATE INDEX idx_property_billing_address_account ON property_billing_address(account_id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove triggers
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_account_billing_address_updated_at ON account_billing_address;
            DROP TRIGGER IF EXISTS update_property_billing_address_updated_at ON property_billing_address;
        `);

        // Remove indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_accounts_status;
            DROP INDEX IF EXISTS idx_account_billing_address_account;
            DROP INDEX IF EXISTS idx_property_billing_address_property;
            DROP INDEX IF EXISTS idx_property_billing_address_account;
        `);

        // Drop tables
        await queryRunner.query(`
            DROP TABLE IF EXISTS property_billing_address;
            DROP TABLE IF EXISTS account_billing_address;
        `);

        // Remove status from accounts
        await queryRunner.query(`
            ALTER TABLE accounts 
            DROP COLUMN IF EXISTS status;
        `);
    }
}
