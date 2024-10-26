import { AppDataSource } from '../config/database';
import { logger } from './logger';

export async function getDatabaseInfo() {
  try {
    // Get current database name
    const dbNameResult = await AppDataSource.query(
      'SELECT current_database() as db_name'
    );
    logger.info('Current database:', dbNameResult[0].db_name);

    // Get all tables
    const tablesResult = await AppDataSource.query(`
      SELECT 
        table_name,
        array_agg(column_name || ' ' || data_type) as columns
      FROM information_schema.columns
      WHERE table_schema = 'public'
      GROUP BY table_name
      ORDER BY table_name;
    `);
    
    logger.info('Existing tables:');
    tablesResult.forEach((table: any) => {
      logger.info(`\nTable: ${table.table_name}`);
      table.columns.forEach((column: string) => {
        logger.info(`  ${column}`);
      });
    });

    // Get PostGIS version if available
    try {
      const postgisVersion = await AppDataSource.query('SELECT PostGIS_Version();');
      logger.info('\nPostGIS Version:', postgisVersion[0].postgis_version);
    } catch (error) {
      logger.warn('PostGIS not installed or not accessible');
    }

  } catch (error) {
    logger.error('Error getting database info:', error);
  }
}
