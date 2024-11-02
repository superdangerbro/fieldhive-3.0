'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { EquipmentTypeConfig, NewFieldState, FormField } from './types';
import { AddEquipmentTypeForm } from './AddEquipmentTypeForm';
import { EquipmentTypeItem } from './EquipmentTypeItem';
import { getEquipmentTypes, saveEquipmentTypes } from '@/services/api';

export function EquipmentTypesSection() {
    const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeConfig[]>([]);
    const [newTypeName, setNewTypeName] = useState('');
    const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
    const [newFields, setNewFields] = useState<Record<string, NewFieldState>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load equipment types
    useEffect(() => {
        const loadTypes = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const typesData = await getEquipmentTypes();
                setEquipmentTypes(typesData || []);
                const fields: Record<string, NewFieldState> = {};
                if (Array.isArray(typesData)) {
                    typesData.forEach((type: EquipmentTypeConfig) => {
                        fields[type.name] = {
                            name: '',
                            type: 'string',
                            required: false,
                            options: [],
                            newOption: '',
                            numberConfig: {}
                        };
                    });
                }
                setNewFields(fields);
            } catch (error) {
                console.error('Error loading equipment types:', error);
                setError('Failed to load equipment types');
            } finally {
                setIsLoading(false);
            }
        };

        loadTypes();
    }, []);

    const handleAddType = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newTypeName && !equipmentTypes.find(t => t.name === newTypeName)) {
            try {
                const updatedTypes = [...equipmentTypes, { name: newTypeName, fields: [] }]
                    .sort((a, b) => a.name.localeCompare(b.name));
                await saveEquipmentTypes(updatedTypes);
                setEquipmentTypes(updatedTypes);
                setNewFields({
                    ...newFields,
                    [newTypeName]: {
                        name: '',
                        type: 'string',
                        required: false,
                        options: [],
                        newOption: '',
                        numberConfig: {}
                    }
                });
                setNewTypeName('');
            } catch (error) {
                console.error('Error saving equipment types:', error);
            }
        }
    };

    const handleUpdateTypeName = async (oldName: string, newName: string) => {
        try {
            const updatedTypes = equipmentTypes.map(type => {
                if (type.name === oldName) {
                    return { ...type, name: newName };
                }
                return type;
            }).sort((a, b) => a.name.localeCompare(b.name));

            // Update newFields with new key
            const updatedNewFields = { ...newFields };
            if (updatedNewFields[oldName]) {
                updatedNewFields[newName] = updatedNewFields[oldName];
                delete updatedNewFields[oldName];
            }

            await saveEquipmentTypes(updatedTypes);
            setEquipmentTypes(updatedTypes);
            setNewFields(updatedNewFields);
        } catch (error) {
            console.error('Error updating equipment type name:', error);
        }
    };

    const handleDeleteType = async (typeName: string) => {
        try {
            const updatedTypes = equipmentTypes.filter(t => t.name !== typeName);
            await saveEquipmentTypes(updatedTypes);
            setEquipmentTypes(updatedTypes);
            const newFieldsCopy = { ...newFields };
            delete newFieldsCopy[typeName];
            setNewFields(newFieldsCopy);
            setExpandedTypes(prev => {
                const next = new Set(prev);
                next.delete(typeName);
                return next;
            });
        } catch (error) {
            console.error('Error saving equipment types:', error);
        }
    };

    const toggleExpand = (typeName: string) => {
        setExpandedTypes(prev => {
            const next = new Set(prev);
            if (next.has(typeName)) {
                next.delete(typeName);
            } else {
                next.add(typeName);
            }
            return next;
        });
    };

    const handleFieldChange = (typeName: string, field: NewFieldState) => {
        setNewFields({
            ...newFields,
            [typeName]: field
        });
    };

    const handleAddField = async (typeName: string) => {
        const newField = newFields[typeName];
        if (newField.name) {
            try {
                const updatedTypes = equipmentTypes.map(type => {
                    if (type.name === typeName) {
                        return {
                            ...type,
                            fields: [...type.fields, {
                                name: newField.name,
                                type: newField.type,
                                required: newField.required,
                                ...(newField.type === 'select' && { options: newField.options }),
                                ...((['number-input', 'number-stepper', 'slider'].includes(newField.type)) && 
                                    { numberConfig: newField.numberConfig })
                            }]
                        };
                    }
                    return type;
                });
                await saveEquipmentTypes(updatedTypes);
                setEquipmentTypes(updatedTypes);
                setNewFields({
                    ...newFields,
                    [typeName]: {
                        name: '',
                        type: 'string',
                        required: false,
                        options: [],
                        newOption: '',
                        numberConfig: {}
                    }
                });
            } catch (error) {
                console.error('Error saving equipment types:', error);
            }
        }
    };

    const handleDeleteField = async (typeName: string, fieldName: string) => {
        try {
            const updatedTypes = equipmentTypes.map(type => {
                if (type.name === typeName) {
                    const updatedFields = type.fields.map(field => ({
                        ...field,
                        showWhen: field.showWhen?.filter(condition => 
                            condition.field !== fieldName
                        )
                    }));
                    
                    return {
                        ...type,
                        fields: updatedFields.filter(field => field.name !== fieldName)
                    };
                }
                return type;
            });
            await saveEquipmentTypes(updatedTypes);
            setEquipmentTypes(updatedTypes);
        } catch (error) {
            console.error('Error saving equipment types:', error);
        }
    };

    const handleReorderFields = async (typeName: string, startIndex: number, endIndex: number) => {
        try {
            const updatedTypes = equipmentTypes.map(type => {
                if (type.name === typeName) {
                    const fields = [...type.fields];
                    const [removed] = fields.splice(startIndex, 1);
                    fields.splice(endIndex, 0, removed);
                    return { ...type, fields };
                }
                return type;
            });
            await saveEquipmentTypes(updatedTypes);
            setEquipmentTypes(updatedTypes);
        } catch (error) {
            console.error('Error saving equipment types:', error);
        }
    };

    const handleUpdateField = async (typeName: string, fieldName: string, updates: Partial<FormField>) => {
        try {
            const updatedTypes = equipmentTypes.map(type => {
                if (type.name === typeName) {
                    return {
                        ...type,
                        fields: type.fields.map(field => 
                            field.name === fieldName 
                                ? { ...field, ...updates }
                                : field
                        )
                    };
                }
                return type;
            });
            await saveEquipmentTypes(updatedTypes);
            setEquipmentTypes(updatedTypes);
        } catch (error) {
            console.error('Error saving equipment types:', error);
        }
    };

    const handleCopyFields = async (targetTypeName: string, fields: FormField[]) => {
        try {
            const updatedTypes = equipmentTypes.map(type => {
                if (type.name === targetTypeName) {
                    const newFields = fields.map(field => {
                        let newName = field.name;
                        let counter = 1;
                        while (type.fields.some(f => f.name === newName)) {
                            newName = `${field.name} (${counter})`;
                            counter++;
                        }
                        return { ...field, name: newName };
                    });

                    return {
                        ...type,
                        fields: [...type.fields, ...newFields]
                    };
                }
                return type;
            });
            await saveEquipmentTypes(updatedTypes);
            setEquipmentTypes(updatedTypes);
        } catch (error) {
            console.error('Error saving equipment types:', error);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2, color: 'error.main' }}>
                <Typography>{error}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Equipment Types
            </Typography>
            
            <AddEquipmentTypeForm
                newTypeName={newTypeName}
                onTypeNameChange={setNewTypeName}
                onAddType={handleAddType}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {equipmentTypes.map((type) => (
                    <EquipmentTypeItem
                        key={type.name}
                        type={type}
                        allTypes={equipmentTypes}
                        isExpanded={expandedTypes.has(type.name)}
                        newField={newFields[type.name]}
                        onToggleExpand={() => toggleExpand(type.name)}
                        onDeleteType={() => handleDeleteType(type.name)}
                        onFieldChange={handleFieldChange}
                        onAddField={handleAddField}
                        onDeleteField={handleDeleteField}
                        onReorderFields={handleReorderFields}
                        onUpdateField={handleUpdateField}
                        onCopyFields={handleCopyFields}
                        onUpdateTypeName={handleUpdateTypeName}
                    />
                ))}
            </Box>
        </Box>
    );
}
