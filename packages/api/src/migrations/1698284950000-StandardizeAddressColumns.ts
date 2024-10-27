import { MigrationInterface, QueryRunner } from "typeorm";

export class StandardizeAddressColumns1698284950000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename columns in account_billing_address
        await queryRunner.query(`
            ALTER TABLE account_billing_address
            RENAME COLUMN address_1 TO address1;

            ALTER TABLE account_billing_address
            RENAME COLUMN address_2 TO address2;

            ALTER TABLE account_billing_address
            RENAME COLUMN postal_code TO "postalCode";
        `);

        // Rename columns in property_billing_address
        await queryRunner.query(`
            ALTER TABLE property_billing_address
            RENAME COLUMN address_1 TO address1;

            ALTER TABLE property_billing_address
            RENAME COLUMN address_2 TO address2;

            ALTER TABLE property_billing_address
            RENAME COLUMN postal_code TO "postalCode";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert column names in account_billing_address
        await queryRunner.query(`
            ALTER TABLE account_billing_address
            RENAME COLUMN address1 TO address_1;

            ALTER TABLE account_billing_address
            RENAME COLUMN address2 TO address_2;

            ALTER TABLE account_billing_address
            RENAME COLUMN "postalCode" TO postal_code;
        `);

        // Revert column names in property_billing_address
        await queryRunner.query(`
            ALTER TABLE property_billing_address
            RENAME COLUMN address1 TO address_1;

            ALTER TABLE property_billing_address
            RENAME COLUMN address2 TO address_2;

            ALTER TABLE property_billing_address
            RENAME COLUMN "postalCode" TO postal_code;
        `);
    }
}
