import { FormField } from '../(pages)/settings/equipment/types/components/types';

// Base field definition that persists across all forms
export interface BaseField {
    name: string;
    type: string;
    description?: string;
}

// Form-specific field configuration that can vary
export interface FormFieldConfig {
    label: string;         // Can be customized per form
    required?: boolean;    // Can be required in some forms but not others
    config?: {            // Form-specific configuration
        requireBarcode?: boolean;
        requirePhoto?: boolean;
        photoInstructions?: string;
        options?: string[];
        [key: string]: any;
    };
}

// Registry to maintain base field definitions
class FieldRegistry {
    private baseFields: Map<string, BaseField> = new Map();

    private constructor() {
        // Only try to load from localStorage in the browser
        if (typeof window !== 'undefined') {
            const savedFields = localStorage.getItem('baseFields');
            if (savedFields) {
                try {
                    const fields = JSON.parse(savedFields);
                    Object.values(fields).forEach((field: any) => {
                        this.baseFields.set(field.name, field as BaseField);
                    });
                } catch (e) {
                    console.error('Error loading fields from localStorage:', e);
                }
            }
        }
    }

    private static instance: FieldRegistry;

    public static getInstance(): FieldRegistry {
        if (!FieldRegistry.instance) {
            FieldRegistry.instance = new FieldRegistry();
        }
        return FieldRegistry.instance;
    }

    // Register a new base field
    public registerField(field: BaseField): void {
        if (!this.baseFields.has(field.name)) {
            this.baseFields.set(field.name, field);
        }
        this.saveToStorage();
    }

    // Get all registered fields
    public getAllFields(): BaseField[] {
        return Array.from(this.baseFields.values());
    }

    // Get a specific field by name
    public getField(name: string): BaseField | undefined {
        return this.baseFields.get(name);
    }

    // Convert a base field to a form field with custom label/config
    public toFormField(baseField: BaseField, customLabel?: string, customConfig?: any): FormField {
        return {
            name: baseField.name,
            label: customLabel || baseField.description || baseField.name,
            type: baseField.type,
            description: baseField.description,
            config: customConfig || {}
        };
    }

    public hasField(name: string): boolean {
        return this.baseFields.has(name);
    }

    private saveToStorage(): void {
        // Only save to localStorage in the browser
        if (typeof window !== 'undefined') {
            const fieldsObj = Object.fromEntries(this.baseFields);
            localStorage.setItem('baseFields', JSON.stringify(fieldsObj));
        }
    }
}

// Create a singleton instance
export const fieldRegistry = FieldRegistry.getInstance();
