import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Setting } from '../../entities/Setting';
import { logger } from '../../utils/logger';

const router = Router();
const EQUIPMENT_STATUS_KEY = 'equipment_status';
const EQUIPMENT_TYPES_KEY = 'equipment_types';

// Helper function to check if a field should be visible based on rules
const isFieldVisible = (field: any, formData: any) => {
    if (!field.showWhen || field.showWhen.length === 0) {
        return true;
    }

    // Check all conditions - field is visible if any condition is met
    return field.showWhen.some((condition: any) => {
        const dependentValue = formData[condition.field];
        return dependentValue === condition.value;
    });
};

// Helper function to check if a field is required based on rules
const isFieldRequired = (field: any, formData: any) => {
    // If field is always required, return true
    if (field.required) {
        return true;
    }

    // If field has no visibility rules, it's not conditionally required
    if (!field.showWhen || field.showWhen.length === 0) {
        return false;
    }

    // Check if any matching condition makes the field required
    return field.showWhen.some((condition: any) => {
        const dependentValue = formData[condition.field];
        return dependentValue === condition.value && condition.makeRequired;
    });
};

// Helper function to validate fields
const validateFields = (formData: any, equipmentType: any) => {
    const errors: string[] = [];

    equipmentType.fields.forEach((field: any) => {
        // Only validate fields that are visible based on rules
        if (isFieldVisible(field, formData)) {
            const value = formData[field.name];
            const isRequired = isFieldRequired(field, formData);

            if (isRequired && (value === undefined || value === null || value === '')) {
                errors.push(`${field.name} is required based on current values`);
            }
        }
    });

    return errors;
};

// Get field equipment
router.get('/', async (req, res) => {
    try {
        const result = await AppDataSource.query(`
            SELECT 
                fe.*,
                s.value as equipment_types
            FROM field_equipment fe
            CROSS JOIN (
                SELECT value FROM settings WHERE key = $1
            ) s
        `, [EQUIPMENT_TYPES_KEY]);

        // Transform the result to include equipment type details
        const transformedResult = result.map((item: any) => {
            const equipmentTypes = JSON.parse(item.equipment_types || '[]');
            const equipmentType = equipmentTypes.find((type: any) => type.name === item.equipment_type_id) || {};
            
            return {
                ...item,
                equipment_type: {
                    name: equipmentType.name || item.equipment_type_id,
                    fields: equipmentType.fields || []
                },
                equipment_types: undefined // Remove the raw equipment_types data
            };
        });

        res.json(transformedResult);
    } catch (error) {
        logger.error('Error fetching field equipment:', error);
        res.status(500).json({ error: 'Failed to fetch field equipment' });
    }
});

// Create field equipment
router.post('/', async (req, res) => {
    try {
        const { equipment_type_id, location, status, ...formData } = req.body;

        // Validate equipment type exists
        const settingsRepository = AppDataSource.getRepository(Setting);
        const [equipmentTypesSetting, statusSetting] = await Promise.all([
            settingsRepository.findOne({ where: { key: EQUIPMENT_TYPES_KEY } }),
            settingsRepository.findOne({ where: { key: EQUIPMENT_STATUS_KEY } })
        ]);

        const equipmentTypes = equipmentTypesSetting?.value || [];
        const equipmentType = equipmentTypes.find((type: any) => type.name === equipment_type_id);
        
        if (!equipmentType) {
            return res.status(400).json({
                error: 'Invalid equipment type',
                message: 'The provided equipment type does not exist'
            });
        }

        // Validate status
        const validStatuses = statusSetting?.value || [];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                message: 'The provided status is not valid',
                validStatuses
            });
        }

        // Validate fields based on visibility and required rules
        const validationErrors = validateFields(formData, equipmentType);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Required fields are missing',
                details: validationErrors
            });
        }

        const [result] = await AppDataSource.query(
            `INSERT INTO field_equipment (equipment_type_id, location, status, data, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [equipment_type_id, location, status, JSON.stringify(formData)]
        );

        // Add equipment type details to response
        result.equipment_type = {
            name: equipmentType.name,
            fields: equipmentType.fields || []
        };

        res.status(201).json(result);
    } catch (error) {
        logger.error('Error creating field equipment:', error);
        res.status(500).json({ error: 'Failed to create field equipment' });
    }
});

// Update field equipment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, location, ...formData } = req.body;

        // Get equipment type for validation
        const settingsRepository = AppDataSource.getRepository(Setting);
        const [equipmentTypesSetting, statusSetting] = await Promise.all([
            settingsRepository.findOne({ where: { key: EQUIPMENT_TYPES_KEY } }),
            settingsRepository.findOne({ where: { key: EQUIPMENT_STATUS_KEY } })
        ]);

        // If status is being updated, validate it
        if (status) {
            const validStatuses = statusSetting?.value || [];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status',
                    message: 'The provided status is not valid',
                    validStatuses
                });
            }
        }

        // Get current equipment for its type
        const [currentEquipment] = await AppDataSource.query(
            'SELECT equipment_type_id FROM field_equipment WHERE equipment_id = $1',
            [id]
        );

        if (!currentEquipment) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Field equipment not found'
            });
        }

        // Get equipment type configuration
        const equipmentTypes = equipmentTypesSetting?.value || [];
        const equipmentType = equipmentTypes.find((type: any) => type.name === currentEquipment.equipment_type_id);

        if (equipmentType) {
            // Validate fields based on visibility and required rules
            const validationErrors = validateFields(formData, equipmentType);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Required fields are missing',
                    details: validationErrors
                });
            }
        }

        const [result] = await AppDataSource.query(
            `UPDATE field_equipment 
             SET 
                status = COALESCE($1, status),
                location = COALESCE($2, location),
                data = COALESCE($3, data),
                updated_at = NOW()
             WHERE equipment_id = $4
             RETURNING *`,
            [status, location, JSON.stringify(formData), id]
        );

        if (!result) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Field equipment not found'
            });
        }

        // Add equipment type details to response
        if (equipmentType) {
            result.equipment_type = {
                name: equipmentType.name,
                fields: equipmentType.fields || []
            };
        }

        res.json(result);
    } catch (error) {
        logger.error('Error updating field equipment:', error);
        res.status(500).json({ error: 'Failed to update field equipment' });
    }
});

// Delete field equipment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await AppDataSource.query(
            'DELETE FROM field_equipment WHERE equipment_id = $1 RETURNING equipment_id',
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Field equipment not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting field equipment:', error);
        res.status(500).json({ error: 'Failed to delete field equipment' });
    }
});

export default router;
