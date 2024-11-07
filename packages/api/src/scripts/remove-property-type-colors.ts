import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

async function removePropertyTypeColors() {
    try {
        logger.info('Starting property type color removal...');
        
        // Initialize database connection
        await AppDataSource.initialize();
        logger.info('Database connected');

        // Update using raw SQL
        await AppDataSource.query(`
            WITH property_types AS (
                SELECT value FROM settings WHERE key = 'property_types'
            )
            UPDATE settings 
            SET value = (
                SELECT json_build_array(
                    json_build_object(
                        'label', 'Residential',
                        'value', 'residential'
                    )
                )::jsonb
            )
            WHERE key = 'property_types'
        `);

        // Verify the update
        const result = await AppDataSource.query(`
            SELECT value FROM settings WHERE key = 'property_types'
        `);

        if (result && result.length > 0) {
            logger.info('Updated property types:', result[0].value);
        }

        logger.info('Successfully removed colors from property types');
        await AppDataSource.destroy();
        logger.info('Database connection closed');
    } catch (error) {
        logger.error('Error removing property type colors:', error);
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(1);
    }
}

removePropertyTypeColors();
