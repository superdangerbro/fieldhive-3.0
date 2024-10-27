import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { PropertyType } from '@fieldhive/shared';

export class AddPropertyTypeColumn1698284960000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasTypeColumn = await queryRunner.hasColumn('properties', 'type');
        
        if (!hasTypeColumn) {
            await queryRunner.addColumn('properties', new TableColumn({
                name: 'type',
                type: 'varchar',
                length: '50',
                isNullable: false,
                default: `'${PropertyType.RESIDENTIAL}'`
            }));

            // Update existing rows to have a valid type
            await queryRunner.query(`
                UPDATE properties 
                SET type = '${PropertyType.RESIDENTIAL}' 
                WHERE type IS NULL OR type = '';
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasTypeColumn = await queryRunner.hasColumn('properties', 'type');
        
        if (hasTypeColumn) {
            await queryRunner.dropColumn('properties', 'type');
        }
    }
}
