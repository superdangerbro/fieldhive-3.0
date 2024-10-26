import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';

// Load environment variables
const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

// Log connection details (without sensitive info)
logger.info('Database connection details:', {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER
});

// This configuration is specifically for running migrations
export const MigrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  // Disable synchronization for migrations
  synchronize: false,
  logging: true,
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  ssl: {
    rejectUnauthorized: false
  },
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
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
