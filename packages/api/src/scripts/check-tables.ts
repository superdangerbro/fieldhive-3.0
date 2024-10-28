import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

const checkTableExists = async (tableName: string) => {
    const result = await AppDataSource.query(
        `SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
        )`, [tableName]
    );
    return result[0].exists;
};

const logTableColumns = async (tableName: string) => {
    const columns = await AppDataSource.query(
        `SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1`, [tableName]
    );
    logger.info(`${tableName} table columns:`, columns);
};

const runChecks = async () => {
    try {
        const tablesToCheck = ['properties', 'properties_accounts_join', 'accounts'];
        
        for (const table of tablesToCheck) {
            const exists = await checkTableExists(table);
            logger.info(`${table.charAt(0).toUpperCase() + table.slice(1)} table exists:`, exists);
            if (exists) {
                await logTableColumns(table);
            }
        }
    } catch (error) {
        logger.error('Error checking tables:', error);
    }
};

runChecks();
