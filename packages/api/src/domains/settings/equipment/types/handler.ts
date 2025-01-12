import { Request, Response } from 'express';
import { AppDataSource } from '../../../../config/database';
import { Setting } from '../../entities/Setting';

// Field types
type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'capture-flow';

interface BaseField {
    name: string;
    type: FieldType;
    required?: boolean;
    description?: string;
    config?: {
        requireBarcode?: boolean;
        requirePhoto?: boolean;
        photoInstructions?: string;
        options?: string[];
        [key: string]: any;
    };
}

interface NumberField extends BaseField {
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
}

interface SelectField extends BaseField {
    type: 'select';
    options: string[];
}

interface TextField extends BaseField {
    type: 'text' | 'textarea';
}

interface CheckboxField extends BaseField {
    type: 'checkbox';
}

interface CaptureFlowField extends BaseField {
    type: 'capture-flow';
    config: {
        requireBarcode: boolean;
        requirePhoto: boolean;
        photoInstructions: string;
    };
}

type Field = NumberField | SelectField | TextField | CheckboxField | CaptureFlowField;

interface EquipmentType {
    name: string;
    fields: Field[];
}

const SETTING_KEY = 'equipment_types';

function validateField(field: Record<string, any>): string[] {
    const errors: string[] = [];

    // Validate required properties
    if (!field.name) {
        errors.push('Field name is required');
    }
    if (!field.type) {
        errors.push('Field type is required');
    }

    // Validate field type
    const validTypes: FieldType[] = ['text', 'number', 'select', 'checkbox', 'textarea', 'capture-flow'];
    if (!validTypes.includes(field.type)) {
        errors.push(`Invalid field type: ${field.type}. Must be one of: ${validTypes.join(', ')}`);
        return errors; // Return early since type-specific validation won't work
    }

    // Type-specific validation
    if (field.type === 'number') {
        if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
            errors.push('Minimum value cannot be greater than maximum value');
        }
        if (field.step !== undefined && field.step <= 0) {
            errors.push('Step value must be greater than 0');
        }
    }

    if (field.type === 'select') {
        if (!Array.isArray(field.options)) {
            errors.push('Select field must have an options array');
        } else if (field.options.length === 0) {
            errors.push('Select field must have at least one option');
        } else {
            // Validate each option is a string
            field.options.forEach((option: any, index: number) => {
                if (typeof option !== 'string') {
                    errors.push(`Option ${index + 1} must be a string`);
                }
            });
        }
    }

    if (field.type === 'capture-flow') {
        if (!field.config) {
            errors.push('Equipment capture field must have a config');
            return errors;
        }
        
        // Validate config structure
        if (typeof field.config.requireBarcode !== 'boolean') {
            errors.push('Equipment capture field must specify requireBarcode as boolean');
        }
        if (typeof field.config.requirePhoto !== 'boolean') {
            errors.push('Equipment capture field must specify requirePhoto as boolean');
        }
        if (typeof field.config.photoInstructions !== 'string') {
            errors.push('Equipment capture field must specify photoInstructions as string');
        }
    }

    return errors;
}

/**
 * Get equipment types from settings
 */
export async function getEquipmentTypes(req: Request, res: Response) {
    try {
        const setting = await AppDataSource
            .getRepository(Setting)
            .findOne({ where: { key: SETTING_KEY } });
        
        if (!setting) {
            return res.json([]);
        }

        // Return array directly
        return res.json(Array.isArray(setting.value) ? setting.value : []);
    } catch (error) {
        return res.status(500).json({ 
            message: 'Failed to get equipment types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

/**
 * Update equipment types in settings
 */
export async function updateEquipmentTypes(req: Request, res: Response) {
    try {
        const types = req.body;
        const repository = AppDataSource.getRepository(Setting);

        // Validate the structure
        if (!Array.isArray(types)) {
            return res.status(400).json({ 
                message: 'Invalid format - expected array of equipment types'
            });
        }

        // Validate each type
        const errors: { type: string; errors: string[] }[] = [];
        for (const type of types) {
            const typeErrors: string[] = [];

            if (!type.name) {
                typeErrors.push('Type name is required');
            }
            if (!Array.isArray(type.fields)) {
                typeErrors.push('Fields must be an array');
            } else {
                // Validate each field
                type.fields.forEach((field: Record<string, any>, index: number) => {
                    const fieldErrors = validateField(field);
                    if (fieldErrors.length > 0) {
                        typeErrors.push(`Field "${field.name || index}": ${fieldErrors.join(', ')}`);
                    }
                });

                // Check for duplicate field names
                const fieldNames = new Set<string>();
                type.fields.forEach((field: Record<string, any>) => {
                    if (field.name && fieldNames.has(field.name)) {
                        typeErrors.push(`Duplicate field name: ${field.name}`);
                    }
                    if (field.name) {
                        fieldNames.add(field.name);
                    }
                });
            }

            if (typeErrors.length > 0) {
                errors.push({
                    type: type.name || 'Unknown type',
                    errors: typeErrors
                });
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        // Update or create the setting
        let setting = await repository.findOne({ where: { key: SETTING_KEY } });
        if (!setting) {
            setting = repository.create({ key: SETTING_KEY, value: types });
        } else {
            setting.value = types;
        }

        const updated = await repository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        return res.status(500).json({ 
            message: 'Failed to update equipment types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
