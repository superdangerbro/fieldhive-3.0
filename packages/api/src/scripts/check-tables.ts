import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

async function checkTables() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connection established');

        // Check properties table
        const propertiesTable = await AppDataSource.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'properties'
            );
        `);
        logger.info('Properties table exists:', propertiesTable[0].exists);

        if (propertiesTable[0].exists) {
            const propertiesColumns = await AppDataSource.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'properties';
            `);
            logger.info('Properties table columns:', propertiesColumns);
        }

        // Check properties_accounts_join table
        const joinTable = await AppDataSource.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'properties_accounts_join'
            );
        `);
        logger.info('Properties accounts join table exists:', joinTable[0].exists);

        if (joinTable[0].exists) {
            const joinColumns = await AppDataSource.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'properties_accounts_join';
            `);
            logger.info('Join table columns:', joinColumns);
        }

        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        logger.error('Error checking tables:', error);
        process.exit(1);
    }
}

checkTables();
