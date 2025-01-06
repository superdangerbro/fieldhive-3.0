import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';
import { env } from './database';

// Load environment variables
const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

// Log connection details (without sensitive info)
logger.info('Database connection details:', {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER
});

// This configuration is specifically for running migrations
export const MigrationDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  // Disable synchronization for migrations
  synchronize: false,
  logging: true,
  // Use glob patterns for entities and migrations
  entities: ['src/domains/*/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  ssl: {
    rejectUnauthorized: false
  }
});

export async function runMigrations() {
  try {
    logger.info('Initializing database connection...');
    await MigrationDataSource.initialize();
    logger.info('Running pending migrations...');
    const migrations = await MigrationDataSource.runMigrations();
    logger.info(`Successfully ran ${migrations.length} migrations`);
    await MigrationDataSource.destroy();
  } catch (error) {
    logger.error('Error running migrations:', error);
    if (MigrationDataSource.isInitialized) {
      await MigrationDataSource.destroy();
    }
    throw error;
  }
}

export async function revertLastMigration() {
  try {
    logger.info('Initializing database connection...');
    await MigrationDataSource.initialize();
    logger.info('Reverting last migration...');
    await MigrationDataSource.undoLastMigration();
    logger.info('Successfully reverted last migration');
    await MigrationDataSource.destroy();
  } catch (error) {
    logger.error('Error reverting migration:', error);
    if (MigrationDataSource.isInitialized) {
      await MigrationDataSource.destroy();
    }
    throw error;
  }
}
