import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

async function setupEquipment() {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        logger.info('Database connection initialized');

        // Drop existing tables
        await AppDataSource.query(`
            DROP TABLE IF EXISTS field_equipment CASCADE;
            DROP TABLE IF EXISTS equipment_types CASCADE;
        `);
        logger.info('Dropped existing tables');

        // Create equipment_types table
        await AppDataSource.query(`
            CREATE TABLE equipment_types (
                equipment_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR NOT NULL UNIQUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        logger.info('Created equipment_types table');

        // Create field_equipment table
        await AppDataSource.query(`
            CREATE TABLE field_equipment (
                equipment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                job_id UUID NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
                equipment_type_id UUID NOT NULL REFERENCES equipment_types(equipment_type_id),
                location GEOMETRY(Point, 4326),
                is_georeferenced BOOLEAN DEFAULT true,
                status VARCHAR DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        logger.info('Created field_equipment table');

        // Create indexes
        await AppDataSource.query(`
            CREATE INDEX idx_field_equipment_location 
            ON field_equipment USING GIST (location);

            CREATE INDEX idx_field_equipment_job 
            ON field_equipment(job_id);

            CREATE INDEX idx_field_equipment_type 
            ON field_equipment(equipment_type_id);
        `);
        logger.info('Created indexes');

        // Insert default equipment types
        await AppDataSource.query(`
            INSERT INTO equipment_types (name) VALUES
            ('Trap'),
            ('Bait Station'),
            ('Sensor')
            ON CONFLICT (name) DO NOTHING;
        `);
        logger.info('Inserted default equipment types');

        // Verify setup
        const [equipmentTypes] = await AppDataSource.query(`
            SELECT COUNT(*) as count FROM equipment_types;
        `);
        logger.info(`Found ${equipmentTypes.count} equipment types`);

        logger.info('Equipment setup completed successfully');
    } catch (error) {
        logger.error('Error setting up equipment:', error);
        throw error;
    } finally {
        await AppDataSource.destroy();
        logger.info('Database connection closed');
    }
}

// Run setup if this script is run directly
if (require.main === module) {
    setupEquipment()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}

export default setupEquipment;
