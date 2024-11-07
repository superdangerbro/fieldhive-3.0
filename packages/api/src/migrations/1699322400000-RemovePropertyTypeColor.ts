import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePropertyTypeColor1699322400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get current property types
        const result = await queryRunner.query(`
            SELECT value FROM settings WHERE key = 'property_types'
        `);

        if (result && result.length > 0) {
            const types = JSON.parse(result[0].value);
            
            // Remove color field from each type
            const updatedTypes = types.map(({ color, ...rest }: any) => rest);

            // Update the settings
            await queryRunner.query(`
                UPDATE settings 
                SET value = $1 
                WHERE key = 'property_types'
            `, [JSON.stringify(updatedTypes)]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No need to restore colors since we're removing them permanently
        return Promise.resolve();
    }
}
