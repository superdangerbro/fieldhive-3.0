import { config } from 'dotenv';
import { resolve } from 'path';
import { MigrationDataSource } from '../config/migrations';
import { logger } from '../utils/logger';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

async function generateMigration() {
  const migrationName = process.argv[2];
  
  if (!migrationName) {
    logger.error('Please provide a migration name');
    logger.info('Usage: pnpm migration:generate MyMigrationName');
    process.exit(1);
  }

  try {
    await MigrationDataSource.initialize();
    logger.info(`Generating migration: ${migrationName}`);
    
    // Generate the migration
    await MigrationDataSource.runMigrations();
    
    logger.info('Migration generated successfully');
  } catch (error) {
    logger.error('Error generating migration:', error);
    process.exit(1);
  } finally {
    if (MigrationDataSource.isInitialized) {
      await MigrationDataSource.destroy();
    }
  }
}

generateMigration();
