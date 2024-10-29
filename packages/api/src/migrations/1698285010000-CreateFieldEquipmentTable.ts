import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFieldEquipmentTable1698285010000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing table first
        await queryRunner.query(`DROP TABLE IF EXISTS field_equipment CASCADE;`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS equipment_types (
                equipment_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR NOT NULL UNIQUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        await queryRunner.query(`
            CREATE TABLE field_equipment (
                equipment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                job_id UUID NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
                equipment_type_id UUID NOT NULL REFERENCES equipment_types(equipment_type_id),
                location GEOMETRY(Point, 4326),
                is_georeferenced BOOLEAN DEFAULT true,
                status VARCHAR DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS field_equipment CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS equipment_types CASCADE;`);
    }
}
