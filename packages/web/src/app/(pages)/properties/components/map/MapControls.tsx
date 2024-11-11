'use client';

import React from 'react';
import { Box, IconButton } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import type { MapControlsProps } from './types';

export default function MapControls({
    mode,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}: MapControlsProps) {
    if (mode !== 'polygon') return null;

    return (
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <IconButton 
                onClick={onUndo} 
                disabled={!canUndo}
                size="small"
                title="Undo"
            >
                <UndoIcon />
            </IconButton>
            <IconButton 
                onClick={onRedo} 
                disabled={!canRedo}
                size="small"
                title="Redo"
            >
                <RedoIcon />
            </IconButton>
        </Box>
    );
}
