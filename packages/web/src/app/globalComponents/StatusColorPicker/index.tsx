'use client';

import React, { useState } from 'react';
import { Box, Typography, Popover, useTheme } from '@mui/material';
import { HexColorPicker } from 'react-colorful';

interface StatusColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

export function StatusColorPicker({ color, onChange }: StatusColorPickerProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

    // Theme colors for quick selection
    const themeColors = [
        { name: 'Primary', color: theme.palette.primary.main },
        { name: 'Secondary', color: theme.palette.secondary.main },
        { name: 'Success', color: theme.palette.success.main },
        { name: 'Warning', color: theme.palette.warning.main },
        { name: 'Error', color: theme.palette.error.main },
        { name: 'Info', color: theme.palette.info.main },
    ];

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Color
            </Typography>
            
            {/* Theme Colors */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {themeColors.map(({ name, color: themeColor }) => (
                    <Box
                        key={name}
                        onClick={() => onChange(themeColor)}
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: themeColor,
                            cursor: 'pointer',
                            border: theme => color === themeColor ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                            '&:hover': {
                                opacity: 0.8
                            }
                        }}
                        title={name}
                    />
                ))}
            </Box>

            {/* Custom Color */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    onClick={handleClick}
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: color,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: '2px solid rgba(255,255,255,0.1)',
                        '&:hover': {
                            opacity: 0.8
                        }
                    }}
                />
                <Typography variant="body2" color="text.secondary">
                    Custom Color
                </Typography>
            </Box>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{
                    '& .react-colorful': {
                        width: '200px !important',
                        height: '200px !important'
                    }
                }}
            >
                <Box sx={{ p: 1 }}>
                    <HexColorPicker color={color} onChange={onChange} />
                </Box>
            </Popover>
        </Box>
    );
}
