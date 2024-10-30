import { AppDataSource } from '../config/database';

async function cleanup() {
    try {
        await AppDataSource.initialize();
        console.log('Database connection initialized');

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            await queryRunner.startTransaction();

            // Drop all old tables first
            console.log('Dropping old tables...');
            const dropTables = [
                'stations',
                'small_station',
                'large_station',
                'user_roles',
                'equipment_statuses',
                'trap_types',
                'beaver_traps',
                'beaver_trap_types',
                'inspection_types',
                'sensor_types',
                'field_types',
                'account_billing_address',
                'property_billing_address',
                'contacts',
                'accounts_contacts_join'
            ];

            for (const table of dropTables) {
                await queryRunner.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
                console.log(`Dropped table ${table}`);
            }

            // Create settings table
            console.log('Creating settings table...');
            await queryRunner.query(`CREATE TABLE IF NOT EXISTS settings (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), key text NOT NULL, value jsonb NOT NULL, scope text NOT NULL DEFAULT 'global', scope_id uuid, created_at timestamptz DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP, UNIQUE (key, scope, COALESCE(scope_id, '00000000-0000-0000-0000-000000000000')));`);

            await queryRunner.commitTransaction();
            console.log('Successfully cleaned up tables');

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error during cleanup:', error);
            throw error;

        } finally {
            await queryRunner.release();
        }

    } catch (error) {
        console.error('Error:', error);
        throw error;

    } finally {
        await AppDataSource.destroy();
    }
}

cleanup().catch(console.error);
