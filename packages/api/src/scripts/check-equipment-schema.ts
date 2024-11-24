import { AppDataSource } from '../config/database';

async function checkEquipmentSchema() {
    try {
        await AppDataSource.initialize();
        
        // Get column information for field_equipment table
        const result = await AppDataSource.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'field_equipment'
            ORDER BY ordinal_position;
        `);
        
        console.log('Field Equipment Table Schema:');
        console.log(JSON.stringify(result, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkEquipmentSchema();
