import { AppDataSource } from '../../../core/config/database';
import { Setting } from '../entities/Setting';
import { CreateSettingDto, UpdateSettingDto } from '../types';
import { logger } from '../../../core/utils/logger';

export class SettingService {
    private settingRepository = AppDataSource.getRepository(Setting);

    async findById(id: string): Promise<Setting | null> {
        try {
            return await this.settingRepository.findOne({
                where: { id }
            });
        } catch (error) {
            logger.error('Error finding setting by ID:', error);
            throw error;
        }
    }

    async findByKey(key: string): Promise<Setting | null> {
        try {
            return await this.settingRepository.findOne({
                where: { key }
            });
        } catch (error) {
            logger.error('Error finding setting by key:', error);
            throw error;
        }
    }

    async create(settingData: CreateSettingDto): Promise<Setting> {
        try {
            this.validateSetting(settingData);
            const setting = this.settingRepository.create(settingData);
            return await this.settingRepository.save(setting);
        } catch (error) {
            logger.error('Error creating setting:', error);
            throw error;
        }
    }

    async update(id: string, settingData: UpdateSettingDto): Promise<Setting | null> {
        try {
            const setting = await this.findById(id);
            if (!setting) {
                return null;
            }

            this.validateSetting(settingData, true);
            this.settingRepository.merge(setting, settingData);
            return await this.settingRepository.save(setting);
        } catch (error) {
            logger.error('Error updating setting:', error);
            throw error;
        }
    }

    private validateSetting(setting: Partial<CreateSettingDto>, isUpdate = false): void {
        const errors: string[] = [];

        if (!isUpdate || setting.key !== undefined) {
            if (!setting.key?.trim()) {
                errors.push('Setting key is required');
            }
        }

        if (!isUpdate || setting.value !== undefined) {
            if (setting.value === undefined || setting.value === null) {
                errors.push('Setting value is required');
            }
        }

        if (errors.length > 0) {
            throw new Error(`Setting validation failed: ${errors.join(', ')}`);
        }
    }
}
