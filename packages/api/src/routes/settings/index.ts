import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Setting } from '../../entities/Setting';
import { logger } from '../../utils/logger';

const router = Router();
const JOB_TYPES_SETTING_KEY = 'job_types';
const ACCOUNT_SETTINGS_KEY = 'account_settings';
const EQUIPMENT_TYPES_KEY = 'equipment_types';
const EQUIPMENT_STATUSES_KEY = 'equipment_statuses';
const EQUIPMENT_KEY = 'equipment';
const PROPERTY_TYPES_KEY = 'property_types';
const PROPERTY_STATUSES_KEY = 'property_statuses';

interface AccountStatus {
    value: string;
    label: string;
    color: 'success' | 'warning' | 'error';
}

interface AccountType {
    value: string;
    label: string;
}

interface AccountSettings {
    statuses: AccountStatus[];
    types: AccountType[];
}

interface EquipmentField {
    name: string;
    type: string;
    required: boolean;
    options?: string[];
    numberConfig?: Record<string, any>;
}

interface EquipmentType {
    name: string;
    fields: EquipmentField[];
}

interface Equipment {
    equipment_id: string;
    equipment_type_id: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    status: string;
    data: Record<string, any>;
    created_at: string;
    updated_at: string;
    equipment_type: {
        name: string;
        fields: EquipmentField[];
    };
}

// Get a setting by key
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        logger.info(`Getting setting for key: ${key}`);

        const settingsRepository = AppDataSource.getRepository(Setting);
        const setting = await settingsRepository.findOne({
            where: { key }
        });

        logger.info(`Found setting:`, setting);

        // Handle default values for specific settings
        if (!setting) {
            let defaultValue: string[] | AccountSettings | EquipmentType[] | Equipment[] | undefined;
            let newSetting;

            switch (key) {
                case PROPERTY_TYPES_KEY: {
                    defaultValue = ['residential', 'commercial', 'industrial', 'agricultural', 'other'];
                    newSetting = settingsRepository.create({
                        key: PROPERTY_TYPES_KEY,
                        value: defaultValue
                    });
                    await settingsRepository.save(newSetting);
                    logger.info(`Created default property types:`, defaultValue);
                    return res.json(defaultValue);
                }

                case PROPERTY_STATUSES_KEY: {
                    defaultValue = ['Active', 'Inactive', 'Archived', 'Pending'];
                    newSetting = settingsRepository.create({
                        key: PROPERTY_STATUSES_KEY,
                        value: defaultValue
                    });
                    await settingsRepository.save(newSetting);
                    logger.info(`Created default property statuses:`, defaultValue);
                    return res.json(defaultValue);
                }

                case JOB_TYPES_SETTING_KEY: {
                    defaultValue = ['Inspection', 'Maintenance', 'Repair', 'Installation', 'Emergency'];
                    newSetting = settingsRepository.create({
                        key: JOB_TYPES_SETTING_KEY,
                        value: defaultValue
                    });
                    await settingsRepository.save(newSetting);
                    logger.info(`Created default job types:`, defaultValue);
                    return res.json({ jobTypes: defaultValue.map(type => ({ id: type, name: type })) });
                }

                case ACCOUNT_SETTINGS_KEY: {
                    defaultValue = {
                        statuses: [
                            { value: 'active', label: 'Active', color: 'success' },
                            { value: 'inactive', label: 'Inactive', color: 'warning' },
                            { value: 'suspended', label: 'Suspended', color: 'error' }
                        ],
                        types: [
                            { value: 'company', label: 'Company' },
                            { value: 'individual', label: 'Individual' }
                        ]
                    } as AccountSettings;
                    newSetting = settingsRepository.create({
                        key: ACCOUNT_SETTINGS_KEY,
                        value: defaultValue
                    });
                    await settingsRepository.save(newSetting);
                    logger.info(`Created default account settings:`, defaultValue);
                    return res.json(defaultValue);
                }

                case EQUIPMENT_TYPES_KEY: {
                    defaultValue = [] as EquipmentType[];
                    newSetting = settingsRepository.create({
                        key: EQUIPMENT_TYPES_KEY,
                        value: defaultValue
                    });
                    await settingsRepository.save(newSetting);
                    logger.info(`Created default equipment types:`, defaultValue);
                    return res.json(defaultValue);
                }

                case EQUIPMENT_STATUSES_KEY: {
                    defaultValue = ['Available', 'In Use', 'Under Maintenance', 'Out of Service'];
                    newSetting = settingsRepository.create({
                        key: EQUIPMENT_STATUSES_KEY,
                        value: defaultValue
                    });
                    await settingsRepository.save(newSetting);
                    logger.info(`Created default equipment statuses:`, defaultValue);
                    return res.json(defaultValue);
                }

                case EQUIPMENT_KEY: {
                    defaultValue = [] as Equipment[];
                    newSetting = settingsRepository.create({
                        key: EQUIPMENT_KEY,
                        value: defaultValue
                    });
                    await settingsRepository.save(newSetting);
                    logger.info(`Created default equipment:`, defaultValue);
                    return res.json(defaultValue);
                }

                default:
                    logger.warn(`No setting found for key: ${key}`);
                    return res.status(404).json({
                        error: 'Setting not found',
                        message: `No setting found for key: ${key}`
                    });
            }
        }

        // Format response for specific settings
        if (key === JOB_TYPES_SETTING_KEY) {
            logger.info(`Returning job types:`, setting.value);
            return res.json({ jobTypes: setting.value.map((type: string) => ({ id: type, name: type })) });
        }

        logger.info(`Returning setting value:`, setting.value);
        res.json(setting.value);
    } catch (error) {
        logger.error('Error fetching setting:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch setting',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Update a setting
router.put('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value, id } = req.body;

        logger.info(`Updating setting for key: ${key}`, { value, id });

        const settingsRepository = AppDataSource.getRepository(Setting);

        // Special handling for equipment operations
        if (key === 'add_equipment') {
            let equipmentSetting = await settingsRepository.findOne({
                where: { key: EQUIPMENT_KEY }
            });

            if (!equipmentSetting) {
                equipmentSetting = settingsRepository.create({
                    key: EQUIPMENT_KEY,
                    value: []
                });
            }

            const newEquipment: Equipment = {
                equipment_id: Date.now().toString(),
                ...value,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            equipmentSetting.value = [...equipmentSetting.value, newEquipment];
            await settingsRepository.save(equipmentSetting);
            logger.info(`Added new equipment:`, newEquipment);
            return res.json(newEquipment);
        }

        if (key === 'update_equipment') {
            const equipmentSetting = await settingsRepository.findOne({
                where: { key: EQUIPMENT_KEY }
            });

            if (!equipmentSetting) {
                logger.warn('Equipment setting not found');
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Equipment not found'
                });
            }

            const equipment = equipmentSetting.value as Equipment[];
            const index = equipment.findIndex(e => e.equipment_id === id);

            if (index === -1) {
                logger.warn(`Equipment not found with id: ${id}`);
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Equipment not found'
                });
            }

            equipment[index] = {
                ...equipment[index],
                ...value,
                updated_at: new Date().toISOString()
            };

            equipmentSetting.value = equipment;
            await settingsRepository.save(equipmentSetting);
            logger.info(`Updated equipment:`, equipment[index]);
            return res.json(equipment[index]);
        }

        if (key === 'delete_equipment') {
            const equipmentSetting = await settingsRepository.findOne({
                where: { key: EQUIPMENT_KEY }
            });

            if (!equipmentSetting) {
                logger.warn('Equipment setting not found');
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Equipment not found'
                });
            }

            const equipment = equipmentSetting.value as Equipment[];
            equipmentSetting.value = equipment.filter(e => e.equipment_id !== id);
            await settingsRepository.save(equipmentSetting);
            logger.info(`Deleted equipment with id: ${id}`);
            return res.json({ success: true });
        }

        // Regular setting update
        let setting = await settingsRepository.findOne({
            where: { key }
        });

        if (!setting) {
            setting = settingsRepository.create({ key, value });
            logger.info(`Created new setting:`, setting);
        } else {
            setting.value = value;
            logger.info(`Updated existing setting:`, setting);
        }

        await settingsRepository.save(setting);
        res.json(setting.value);
    } catch (error) {
        logger.error('Error updating setting:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update setting',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;
