import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobAddresses1698285091002 implements MigrationInterface {
    name = 'AddJobAddresses1698285091002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add use_custom_addresses boolean field
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            ADD COLUMN "use_custom_addresses" boolean NOT NULL DEFAULT false
        `);

        // Add service_address_id with foreign key
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            ADD COLUMN "service_address_id" uuid NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            ADD CONSTRAINT "FK_jobs_service_address" 
            FOREIGN KEY ("service_address_id") 
            REFERENCES "addresses"("address_id") 
            ON DELETE SET NULL
        `);

        // Add billing_address_id with foreign key
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            ADD COLUMN "billing_address_id" uuid NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            ADD CONSTRAINT "FK_jobs_billing_address" 
            FOREIGN KEY ("billing_address_id") 
            REFERENCES "addresses"("address_id") 
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints first
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            DROP CONSTRAINT "FK_jobs_service_address"
        `);
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            DROP CONSTRAINT "FK_jobs_billing_address"
        `);

        // Remove columns
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            DROP COLUMN "service_address_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            DROP COLUMN "billing_address_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "jobs" 
            DROP COLUMN "use_custom_addresses"
        `);
    }
}
