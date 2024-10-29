'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { EquipmentTypeConfig, NewFieldState, FormField } from './components/types';
import AddEquipmentTypeForm from './components/AddEquipmentTypeForm';
import EquipmentTypeItem from './components/EquipmentTypeItem';
import { getEquipmentTypes, saveEquipmentTypes, getEquipmentStatuses, saveEquipmentStatuses } from '../../services/api';

export default function EquipmentTab() {
    const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeConfig[]>([]);
    const [newTypeName, setNewTypeName] = useState('');
    const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
    const [newFields, setNewFields] = useState<Record<string, NewFieldState>>({});

    // Equipment Status Management
    const [equipmentStatuses, setEquipmentStatuses] = useState<string[]>([]);
    const [newStatus, setNewStatus] = useState('');
    const [editingStatus, setEditingStatus] = useState<{ index: number; value: string } | null>(null);

    // Load saved configurations
    useEffect(() => {
        Promise.all([
            getEquipmentTypes(),
            getEquipmentStatuses()
        ]).then(([typesData, statusData]) => {
            setEquipmentTypes(typesData);
            const fields: Record<string, NewFieldState> = {};
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
            setNewFields(fields);
            setEquipmentStatuses(statusData || []);
        }).catch(error => console.error('Error loading equipment configurations:', error));
    }, []);

    // Equipment Status Management
    const handleAddStatus = () => {
        if (newStatus && !equipmentStatuses.includes(newStatus)) {
            const updatedStatuses = [...equipmentStatuses, newStatus].sort();
            setEquipmentStatuses(updatedStatuses);
            setNewStatus('');
            saveEquipmentStatuses(updatedStatuses)
                .catch(error => console.error('Error saving equipment statuses:', error));
        }
    };

    const handleDeleteStatus = (index: number) => {
        const updatedStatuses = equipmentStatuses.filter((_, i) => i !== index);
        setEquipmentStatuses(updatedStatuses);
        saveEquipmentStatuses(updatedStatuses)
            .catch(error => console.error('Error saving equipment statuses:', error));
    };

    const handleEditStatus = (index: number) => {
        setEditingStatus({ index, value: equipmentStatuses[index] });
    };

    const handleSaveStatus = () => {
        if (editingStatus && editingStatus.value) {
            const updatedStatuses = [...equipmentStatuses];
            updatedStatuses[editingStatus.index] = editingStatus.value;
            setEquipmentStatuses(updatedStatuses);
            setEditingStatus(null);
            saveEquipmentStatuses(updatedStatuses)
                .catch(error => console.error('Error saving equipment statuses:', error));
        }
    };

    // Equipment Types Management
    const handleAddType = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newTypeName && !equipmentTypes.find(t => t.name === newTypeName)) {
            const updatedTypes = [...equipmentTypes, { name: newTypeName, fields: [] }]
                .sort((a, b) => a.name.localeCompare(b.name));
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
            saveEquipmentTypes(updatedTypes).catch(error => 
                console.error('Error saving equipment types:', error)
            );
        }
    };

    const handleDeleteType = (typeName: string) => {
        const updatedTypes = equipmentTypes.filter(t => t.name !== typeName);
        setEquipmentTypes(updatedTypes);
        const newFieldsCopy = { ...newFields };
        delete newFieldsCopy[typeName];
        setNewFields(newFieldsCopy);
        setExpandedTypes(prev => {
            const next = new Set(prev);
            next.delete(typeName);
            return next;
        });
        saveEquipmentTypes(updatedTypes).catch(error => 
            console.error('Error saving equipment types:', error)
        );
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

    const handleAddField = (typeName: string) => {
        const newField = newFields[typeName];
        if (newField.name) {
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
            setEquipmentTypes(updatedTypes);
            saveEquipmentTypes(updatedTypes).catch(error => 
                console.error('Error saving equipment types:', error)
            );

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
        }
    };

    const handleDeleteField = (typeName: string, fieldName: string) => {
        const updatedTypes = equipmentTypes.map(type => {
            if (type.name === typeName) {
                const updatedFields = type.fields.map(field => ({
                    ...field,
                    showWhen: field.showWhen?.filter(condition => condition.field !== fieldName)
                }));
                
                return {
                    ...type,
                    fields: updatedFields.filter(field => field.name !== fieldName)
                };
            }
            return type;
        });
        setEquipmentTypes(updatedTypes);
        saveEquipmentTypes(updatedTypes).catch(error => 
            console.error('Error saving equipment types:', error)
        );
    };

    const handleReorderFields = (typeName: string, startIndex: number, endIndex: number) => {
        const updatedTypes = equipmentTypes.map(type => {
            if (type.name === typeName) {
                const fields = [...type.fields];
                const [removed] = fields.splice(startIndex, 1);
                fields.splice(endIndex, 0, removed);
                return { ...type, fields };
            }
            return type;
        });
        setEquipmentTypes(updatedTypes);
        saveEquipmentTypes(updatedTypes).catch(error => 
            console.error('Error saving equipment types:', error)
        );
    };

    const handleUpdateField = (typeName: string, fieldName: string, updates: Partial<FormField>) => {
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
        setEquipmentTypes(updatedTypes);
        saveEquipmentTypes(updatedTypes).catch(error => 
            console.error('Error saving equipment types:', error)
        );
    };

    const handleCopyFields = (targetTypeName: string, fields: FormField[]) => {
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
        setEquipmentTypes(updatedTypes);
        saveEquipmentTypes(updatedTypes).catch(error => 
            console.error('Error saving equipment types:', error)
        );
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Equipment Status Section */}
            <Typography variant="h6" gutterBottom>
                Equipment Statuses
            </Typography>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="New Status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddStatus()}
                    />
                    <Button variant="contained" onClick={handleAddStatus}>
                        Add Status
                    </Button>
                </Box>
                <List>
                    {equipmentStatuses.map((status, index) => (
                        <ListItem key={index}>
                            {editingStatus?.index === index ? (
                                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                    <TextField
                                        fullWidth
                                        value={editingStatus.value}
                                        onChange={(e) => setEditingStatus({ ...editingStatus, value: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveStatus()}
                                    />
                                    <Button onClick={handleSaveStatus}>Save</Button>
                                    <Button onClick={() => setEditingStatus(null)}>Cancel</Button>
                                </Box>
                            ) : (
                                <>
                                    <ListItemText primary={status} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" onClick={() => handleEditStatus(index)} sx={{ mr: 1 }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" onClick={() => handleDeleteStatus(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Equipment Types Section */}
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
                    />
                ))}
            </Box>
        </Box>
    );
}
