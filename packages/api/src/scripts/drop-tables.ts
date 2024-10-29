import { getDataSource } from '../config/database';

async function dropTables() {
    const dataSource = await getDataSource();
    
    try {
        await dataSource.query('DROP TABLE IF EXISTS field_equipment CASCADE;');
        console.log('Successfully dropped field_equipment table');
    } catch (error) {
        console.error('Error dropping tables:', error);
    } finally {
        await dataSource.destroy();
    }
}

dropTables().catch(console.error);
