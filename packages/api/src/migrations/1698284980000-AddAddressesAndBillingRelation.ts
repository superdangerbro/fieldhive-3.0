import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressesAndBillingRelation1698284980000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create addresses table
        await queryRunner.query(`
            CREATE TABLE addresses (
                address_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                address1 VARCHAR(255) NOT NULL,
                address2 VARCHAR(255),
                city VARCHAR(255) NOT NULL,
                province VARCHAR(255) NOT NULL,
                postal_code VARCHAR(255) NOT NULL,
                country VARCHAR(255) NOT NULL,
                label VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Add billing_address_id to properties
            ALTER TABLE properties
            ADD COLUMN billing_address_id UUID,
            ADD CONSTRAINT fk_properties_billing_address
            FOREIGN KEY (billing_address_id)
            REFERENCES addresses(address_id)
            ON DELETE SET NULL;

            -- Create index for the foreign key
            CREATE INDEX idx_properties_billing_address
            ON properties(billing_address_id);

            -- Add updated_at trigger for addresses
            CREATE TRIGGER update_addresses_updated_at
                BEFORE UPDATE ON addresses
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Remove foreign key constraint and index
            ALTER TABLE properties
            DROP CONSTRAINT IF EXISTS fk_properties_billing_address;
            
            DROP INDEX IF EXISTS idx_properties_billing_address;

            -- Remove billing_address_id column
            ALTER TABLE properties
            DROP COLUMN IF EXISTS billing_address_id;

            -- Remove trigger
            DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;

            -- Drop addresses table
            DROP TABLE IF EXISTS addresses;
        `);
    }
}
