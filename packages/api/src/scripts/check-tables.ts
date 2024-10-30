import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

interface TableInfo {
    table_name: string;
}

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
        `SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position`, [tableName]
    );
    logger.info(`${tableName} table columns:`, columns);
};

const logForeignKeys = async (tableName: string) => {
    const foreignKeys = await AppDataSource.query(`
        SELECT
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = $1
        AND tc.constraint_type = 'FOREIGN KEY';
    `, [tableName]);
    
    if (foreignKeys.length > 0) {
        logger.info(`${tableName} foreign keys:`, foreignKeys);
    }
};

const runChecks = async () => {
    try {
        await AppDataSource.initialize();
        logger.info('Database connection initialized');

        // Get all tables in the public schema
        const tables = await AppDataSource.query<TableInfo[]>(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        logger.info('Found tables:', tables.map(t => t.table_name));
        
        for (const table of tables) {
            logger.info(`\nChecking table: ${table.table_name}`);
            await logTableColumns(table.table_name);
            await logForeignKeys(table.table_name);
        }

    } catch (error) {
        logger.error('Error checking tables:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
};

runChecks().catch(console.error);
