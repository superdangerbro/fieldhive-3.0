import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTitleToJobs1698285091001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE jobs ADD COLUMN title character varying NOT NULL DEFAULT 'Untitled Job';`);
        await queryRunner.query(`ALTER TABLE jobs ALTER COLUMN title DROP DEFAULT;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE jobs DROP COLUMN title;`);
    }
}
