import 'dotenv/config';
import { AppDataSource } from '../config/database';
import { getDatabaseInfo } from '../utils/db-info';
import { logger } from '../utils/logger';

async function main() {
  try {
    logger.info('\nChecking database connection and schema...\n');
    await AppDataSource.initialize();
    await getDatabaseInfo();
  } catch (error) {
    logger.error('Error:', error);
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

main();
