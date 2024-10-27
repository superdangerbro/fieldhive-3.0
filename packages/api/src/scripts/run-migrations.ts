import { config } from 'dotenv';
import { resolve } from 'path';
import { runMigrations } from '../config/migrations';
import { logger } from '../utils/logger';

// Load environment variables
const envPath = resolve(__dirname, '../../.env');
logger.info('Loading environment variables from:', envPath);
const result = config({ path: envPath });

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

// Log connection details (without sensitive info)
logger.info('Database connection details:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER
});

async function main() {
  try {
    logger.info('Starting migration process...');
    await runMigrations();
    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
