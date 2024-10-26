import { config } from 'dotenv';
import { resolve } from 'path';
import { revertLastMigration } from '../config/migrations';
import { logger } from '../utils/logger';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

async function main() {
  try {
    logger.info('Starting migration reversion...');
    await revertLastMigration();
    logger.info('Migration reverted successfully');
  } catch (error) {
    logger.error('Migration reversion failed:', error);
    process.exit(1);
  }
}

main();
