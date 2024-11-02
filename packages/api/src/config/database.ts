import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';
import { dbConfig, env } from './env';
import { Property } from '../domains/properties/entities/Property';
import { Account } from '../domains/accounts/entities/Account';
import { Address } from '../domains/addresses/entities/Address';
import { Job } from '../domains/jobs/entities/Job';
import { Setting } from '../domains/settings/entities/Setting';
import { UsersAccounts } from '../jointables';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: false,
    logging: env.ENABLE_QUERY_LOGGING,
    entities: [
        Property, 
        Account, 
        Address, 
        Job, 
        Setting,
        UsersAccounts
    ],
    migrations: ['src/migrations/**/*.ts'],
    subscribers: ['src/subscribers/**/*.ts'],
    ssl: dbConfig.ssl,
    connectTimeoutMS: dbConfig.pool.idleTimeoutMillis,
    extra: {
        ssl: dbConfig.ssl,
        poolSize: dbConfig.pool.max
    }
});

export async function setupDatabase() {
    try {
        logger.info('Environment variables:', {
            DB_HOST: env.DB_HOST,
            DB_PORT: env.DB_PORT,
            DB_USER: env.DB_USER,
            DB_NAME: env.DB_NAME
        });

        logger.info('Database config:', {
            ...dbConfig,
            password: '******' // Hide password in logs
        });

        logger.info('Connecting to database...');
        logger.info(`Host: ${dbConfig.host}`);
        logger.info(`Database: ${dbConfig.database}`);

        // Initialize database connection
        await AppDataSource.initialize();

        // Enable PostGIS extension if not already enabled
        await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "postgis"');

        // Get PostgreSQL version
        const result = await AppDataSource.query('SELECT version()');
        logger.info('Database connection established', { version: result[0].version });

        // Verify connection is working
        const timestamp = await AppDataSource.query('SELECT NOW()');
        logger.info('Database connection verified:', timestamp[0].now);

        return AppDataSource;
    } catch (error) {
        logger.error('Error connecting to database:', error);
        throw error;
    }
}

export async function closeDatabase() {
    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            logger.info('Database connection closed');
        }
    } catch (error) {
        logger.error('Error closing database connection:', error);
        throw error;
    }
}

// Handle cleanup on process termination
process.on('SIGINT', async () => {
    logger.info('Received SIGINT. Closing database connection...');
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM. Closing database connection...');
    await closeDatabase();
    process.exit(0);
});

export default AppDataSource;
