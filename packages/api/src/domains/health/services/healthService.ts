import { AppDataSource } from '../../../core/config/database';
import { logger } from '../../../core/utils/logger';

export class HealthService {
    async checkDatabase(): Promise<boolean> {
        try {
            await AppDataSource.query('SELECT 1');
            return true;
        } catch (error) {
            logger.error('Database health check failed:', error);
            return false;
        }
    }

    async getSystemStatus(): Promise<{
        database: boolean;
        api: boolean;
        timestamp: string;
    }> {
        const dbStatus = await this.checkDatabase();
        
        return {
            database: dbStatus,
            api: true, // API is running if we can execute this
            timestamp: new Date().toISOString()
        };
    }
}
