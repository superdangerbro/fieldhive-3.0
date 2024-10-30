import { MigrationInterface, QueryRunner } from "typeorm";

export class ReplaceIsCompanyWithType1698285091000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new type column
        await queryRunner.query(`ALTER TABLE accounts ADD COLUMN type character varying;`);

        // Convert existing is_company values to type
        await queryRunner.query(`
            UPDATE accounts 
            SET type = CASE 
                WHEN is_company = true THEN 'Company'
                ELSE 'Individual'
            END;
        `);

        // Make type not null after setting default values
        await queryRunner.query(`ALTER TABLE accounts ALTER COLUMN type SET NOT NULL;`);

        // Drop is_company column
        await queryRunner.query(`ALTER TABLE accounts DROP COLUMN is_company;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add is_company column back
        await queryRunner.query(`ALTER TABLE accounts ADD COLUMN is_company boolean;`);

        // Convert type values back to is_company
        await queryRunner.query(`
            UPDATE accounts 
            SET is_company = CASE 
                WHEN type = 'Company' THEN true
                ELSE false
            END;
        `);

        // Make is_company not null after setting values
        await queryRunner.query(`ALTER TABLE accounts ALTER COLUMN is_company SET NOT NULL;`);

        // Drop type column
        await queryRunner.query(`ALTER TABLE accounts DROP COLUMN type;`);
    }
}
