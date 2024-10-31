import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';
import { Property } from '../entities/Property';
import { Address } from '../entities/Address';
import { Job } from '../entities/Job';
import { Account } from '../entities/Account';
import { PropertiesAccounts } from '../entities/PropertiesAccounts';
import { Setting } from '../entities/Setting';
import { UsersAccounts } from '../entities/UsersAccounts';

// Load environment variables
const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

// Log connection details (without sensitive info)
logger.info('Database connection details:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER
});

// This configuration is specifically for running migrations
export const MigrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Disable synchronization for migrations
  synchronize: false,
  logging: true,
  entities: [Property, Address, Job, Account, PropertiesAccounts, Setting, UsersAccounts],
  migrations: [resolve(__dirname, '../migrations/*{.ts,.js}')],
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
