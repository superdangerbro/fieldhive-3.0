import type { FieldType, FormField, NumberConfig, SelectConfig } from '../components/types';

const VALID_FIELD_TYPES: FieldType[] = ['text', 'number', 'select', 'checkbox', 'textarea'];

export function isValidFieldType(type: string): type is FieldType {
    return VALID_FIELD_TYPES.includes(type as FieldType);
}

export function validateFieldConfig(field: FormField): string[] {
    const errors: string[] = [];

    // Validate required properties
    if (!field.name) {
        errors.push('Field name is required');
    }
    if (!field.label) {
        errors.push('Field label is required');
    }
    if (!field.type) {
        errors.push('Field type is required');
    }

    // Validate field type
    if (!isValidFieldType(field.type)) {
        errors.push(`Invalid field type: ${field.type}. Must be one of: ${VALID_FIELD_TYPES.join(', ')}`);
    }

    // Validate type-specific configuration
    if (field.type === 'number' && field.config) {
        const config = field.config as NumberConfig;
        if (config.min !== undefined && config.max !== undefined && config.min > config.max) {
            errors.push('Minimum value cannot be greater than maximum value');
        }
        if (config.step !== undefined && config.step <= 0) {
            errors.push('Step value must be greater than 0');
        }
    }

    if (field.type === 'select' && field.config) {
        const config = field.config as SelectConfig;
        if (!Array.isArray(config.options)) {
            errors.push('Select field must have an options array');
        } else if (config.options.length === 0) {
            errors.push('Select field must have at least one option');
        }
    }

    // Validate conditions
    if (field.conditions?.length) {
        field.conditions.forEach((condition, index) => {
            if (!condition.field) {
                errors.push(`Condition ${index + 1}: Field reference is required`);
            }
            if (condition.value === undefined || condition.value === '') {
                errors.push(`Condition ${index + 1}: Value is required`);
            }
        });
    }

    return errors;
}

export function validateEquipmentType(type: { value: string; label: string; fields: FormField[] }): string[] {
    const errors: string[] = [];

    // Validate required properties
    if (!type.value) {
        errors.push('Type value is required');
    }
    if (!type.label) {
        errors.push('Type label is required');
    }
    if (!Array.isArray(type.fields)) {
        errors.push('Fields must be an array');
        return errors;
    }

    // Validate field names are unique
    const fieldNames = new Set<string>();
    type.fields.forEach(field => {
        if (fieldNames.has(field.name)) {
            errors.push(`Duplicate field name: ${field.name}`);
        }
        fieldNames.add(field.name);
    });

    // Validate each field
    type.fields.forEach((field, index) => {
        const fieldErrors = validateFieldConfig(field);
        if (fieldErrors.length > 0) {
            errors.push(`Field "${field.name || index}": ${fieldErrors.join(', ')}`);
        }
    });

    // Validate condition references
    type.fields.forEach(field => {
        field.conditions?.forEach((condition, index) => {
            if (!type.fields.some(f => f.name === condition.field)) {
                errors.push(`Field "${field.name}" condition ${index + 1}: References non-existent field "${condition.field}"`);
            }
        });
    });

    return errors;
}

export function validateApiResponse(data: unknown): string[] {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
        errors.push('API response must be an array');
        return errors;
    }

    data.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
            errors.push(`Item ${index + 1}: Must be an object`);
            return;
        }

        if (!('name' in item)) {
            errors.push(`Item ${index + 1}: Missing required property 'name'`);
        }

        if (!('fields' in item) || !Array.isArray(item.fields)) {
            errors.push(`Item ${index + 1}: Missing or invalid 'fields' array`);
            return;
        }

        item.fields.forEach((field: any, fieldIndex: number) => {
            if (!field || typeof field !== 'object') {
                errors.push(`Item ${index + 1}, Field ${fieldIndex + 1}: Must be an object`);
                return;
            }

            if (!field.name) {
                errors.push(`Item ${index + 1}, Field ${fieldIndex + 1}: Missing required property 'name'`);
            }
            if (!field.type) {
                errors.push(`Item ${index + 1}, Field ${fieldIndex + 1}: Missing required property 'type'`);
            }
            if (field.type === 'select' && (!field.options || !Array.isArray(field.options))) {
                errors.push(`Item ${index + 1}, Field ${fieldIndex + 1}: Select field missing or invalid 'options' array`);
            }
        });
    });

    return errors;
}
