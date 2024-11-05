'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Card, CardContent } from '@mui/material';
import { useJobTypes, useUpdateJobTypes } from '../hooks/useJobs';
import { useJobTypeStore } from './store';
import { StatusColorPicker } from '@/app/globalComponents/StatusColorPicker';

export default function JobTypesPage() {
    const { data: types = [], isLoading } = useJobTypes();
    const updateMutation = useUpdateJobTypes();
    const { 
        editedTypes, 
        isEditing,
        setEditedTypes, 
        updateType,
        startEditing,
        stopEditing 
    } = useJobTypeStore();

    // Initialize edited types when data is loaded
    useEffect(() => {
        if (types && types.length > 0 && !isEditing) {
            setEditedTypes(types);
        }
    }, [types, isEditing, setEditedTypes]);

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(editedTypes);
            stopEditing();
        } catch (error) {
            console.error('Failed to update job types:', error);
        }
    };

    const handleColorChange = (index: number, color: string) => {
        if (!isEditing) startEditing();
        updateType(index, { color });
    };

    const handleCancel = () => {
        stopEditing();
        setEditedTypes(types);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Job Types</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {isEditing && (
                        <Button 
                            variant="outlined"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button 
                        variant="contained" 
                        onClick={handleSave}
                        disabled={updateMutation.isPending || !isEditing}
                    >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Box>

            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {editedTypes.map((type, index) => (
                            <Box 
                                key={type.value} 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 1,
                                    bgcolor: 'background.paper'
                                }}
                            >
                                <Typography sx={{ flex: 1 }}>{type.label || type.value}</Typography>
                                <StatusColorPicker
                                    color={type.color}
                                    onChange={(color) => handleColorChange(index, color)}
                                />
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
