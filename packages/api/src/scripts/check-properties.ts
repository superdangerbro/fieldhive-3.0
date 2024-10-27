import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

// Load environment variables from .env file
const envPath = resolve(process.cwd(), 'packages/api/.env');
logger.info('Loading environment variables from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    logger.error('Error loading .env file:', result.error);
    process.exit(1);
}

// Verify environment variables
const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    logger.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

async function checkProperties() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connection established');

        // Check if there are any properties
        const properties = await AppDataSource.query(`
            SELECT 
                p.property_id as id,
                p.name,
                p.address,
                p.status,
                p.type,
                ST_AsGeoJSON(p.location)::jsonb as location,
                p.created_at as "createdAt",
                p.updated_at as "updatedAt"
            FROM properties p
        `);

        logger.info('Properties in database:', properties);

        // Check if there are any property-account relationships
        const relationships = await AppDataSource.query(`
            SELECT 
                p.name as property_name,
                a.name as account_name,
                paj.role
            FROM properties_accounts_join paj
            JOIN properties p ON p.property_id = paj.property_id
            JOIN accounts a ON a.account_id = paj.account_id
        `);

        logger.info('Property-Account relationships:', relationships);

        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        logger.error('Error checking properties:', error);
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(1);
    }
}

checkProperties();
