'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { usePropertyStatuses, useUpdatePropertyStatuses } from '../hooks/useProperties';
import { usePropertyStatusStore } from './store';
import { StatusColorPicker } from '@/app/globalComponents/StatusColorPicker';

export function PropertyStatusSection() {
    const { data: statuses = [], isLoading } = usePropertyStatuses();
    const updateMutation = useUpdatePropertyStatuses();
    const { 
        editedStatuses, 
        isEditing,
        setEditedStatuses, 
        updateStatus,
        startEditing,
        stopEditing 
    } = usePropertyStatusStore();

    // Initialize edited statuses when data is loaded
    useEffect(() => {
        if (statuses && statuses.length > 0 && !isEditing) {
            setEditedStatuses(statuses);
        }
    }, [statuses, isEditing, setEditedStatuses]);

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(editedStatuses);
            stopEditing();
        } catch (error) {
            console.error('Failed to update property statuses:', error);
        }
    };

    const handleColorChange = (index: number, color: string) => {
        if (!isEditing) startEditing();
        updateStatus(index, { color });
    };

    const handleCancel = () => {
        stopEditing();
        setEditedStatuses(statuses);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Property Statuses</Typography>
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {editedStatuses.map((status, index) => (
                    <Box 
                        key={status.value} 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Typography sx={{ flex: 1 }}>{status.label || status.value}</Typography>
                        <StatusColorPicker
                            color={status.color}
                            onChange={(color) => handleColorChange(index, color)}
                        />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
