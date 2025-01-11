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

export function validateEquipmentType(type: { 
    value: string; 
    label: string; 
    sections: Array<{ 
        id: string; 
        title: string; 
        order: number; 
        fields: FormField[] 
    }> 
}): string[] {
    const errors: string[] = [];

    // Validate required properties
    if (!type.value) {
        errors.push('Type value is required');
    }
    if (!type.label) {
        errors.push('Type label is required');
    }
    if (!Array.isArray(type.sections)) {
        errors.push('Sections must be an array');
        return errors;
    }

    // Validate sections
    type.sections.forEach((section, sectionIndex) => {
        if (!section.id) {
            errors.push(`Section ${sectionIndex + 1}: ID is required`);
        }
        if (!section.title) {
            errors.push(`Section ${sectionIndex + 1}: Title is required`);
        }
        if (!Array.isArray(section.fields)) {
            errors.push(`Section "${section.title || sectionIndex}": Fields must be an array`);
            return;
        }

        // Validate field names are unique across all sections
        const fieldNames = new Set<string>();
        type.sections.forEach(s => {
            s.fields.forEach(field => {
                if (fieldNames.has(field.name)) {
                    errors.push(`Duplicate field name across sections: ${field.name}`);
                }
                fieldNames.add(field.name);
            });
        });

        // Validate each field in the section
        section.fields.forEach((field, fieldIndex) => {
            const fieldErrors = validateFieldConfig(field);
            if (fieldErrors.length > 0) {
                errors.push(`Section "${section.title}", Field "${field.name || fieldIndex}": ${fieldErrors.join(', ')}`);
            }
        });

        // Validate condition references across all sections
        section.fields.forEach(field => {
            field.conditions?.forEach((condition, conditionIndex) => {
                const fieldExists = type.sections.some(s => 
                    s.fields.some(f => f.name === condition.field)
                );
                if (!fieldExists) {
                    errors.push(`Section "${section.title}", Field "${field.name}" condition ${conditionIndex + 1}: References non-existent field "${condition.field}"`);
                }
            });
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
