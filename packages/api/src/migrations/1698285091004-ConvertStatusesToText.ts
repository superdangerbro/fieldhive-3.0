import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertStatusesToText1698285091004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop enum constraints and convert to text
        await queryRunner.query(`
            -- Convert jobs.status to text
            ALTER TABLE jobs 
            ALTER COLUMN status TYPE text;

            -- Convert field_equipment.status to text
            ALTER TABLE field_equipment 
            ALTER COLUMN status TYPE text;

            -- Convert accounts.status to text
            ALTER TABLE accounts 
            ALTER COLUMN status TYPE text;

            -- Convert properties.status to text
            ALTER TABLE properties 
            ALTER COLUMN status TYPE text;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: We don't restore the enum constraints in down migration
        // as it could fail if there are values outside the enum
        await queryRunner.query(`
            -- No need to revert as text type is more permissive than enum
            -- and we want to support dynamic statuses going forward
        `);
    }
}
