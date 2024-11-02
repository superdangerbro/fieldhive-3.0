import { Repository } from 'typeorm';
import { AppDataSource } from '../../../core/config/database';
import { Setting } from '../entities/Setting';
import { CreateSettingDto, UpdateSettingDto } from '../types';
import { logger } from '../../../core/utils/logger';

export class SettingService {
    private settingRepository: Repository<Setting>;

    constructor() {
        this.settingRepository = AppDataSource.getRepository(Setting);
    }

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

            this.settingRepository.merge(setting, settingData);
            return await this.settingRepository.save(setting);
        } catch (error) {
            logger.error('Error updating setting:', error);
            throw error;
        }
    }

    async upsertByKey(key: string, value: any): Promise<Setting> {
        try {
            let setting = await this.findByKey(key);
            
            if (!setting) {
                setting = this.settingRepository.create({
                    key,
                    value
                });
            } else {
                setting.value = value;
            }

            return await this.settingRepository.save(setting);
        } catch (error) {
            logger.error('Error upserting setting:', error);
            throw error;
        }
    }
}
