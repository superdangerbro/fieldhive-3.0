'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Select,
    MenuItem,
    useTheme
} from '@mui/material';
import { ChromePicker, ColorResult } from 'react-color';

interface StatusColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

type ThemeColorKey = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'text';
type ThemeColors = Record<ThemeColorKey, string>;

export function StatusColorPicker({ color: initialColor, onChange }: StatusColorPickerProps) {
    const theme = useTheme();
    const [colorSource, setColorSource] = useState<'theme' | 'custom'>('theme');
    const [selectedThemeColor, setSelectedThemeColor] = useState<ThemeColorKey>('primary');
    const [customColor, setCustomColor] = useState(initialColor);
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Get theme colors
    const themeColors: ThemeColors = {
        primary: theme.palette.primary.main,
        secondary: theme.palette.secondary.main,
        error: theme.palette.error.main,
        warning: theme.palette.warning.main,
        info: theme.palette.info.main,
        success: theme.palette.success.main,
        text: theme.palette.text.secondary
    };

    useEffect(() => {
        // Try to match the initial color to a theme color
        const themeColorEntry = Object.entries(themeColors).find(([_, value]) => value === initialColor);
        if (themeColorEntry) {
            setColorSource('theme');
            setSelectedThemeColor(themeColorEntry[0] as ThemeColorKey);
        } else {
            setColorSource('custom');
            setCustomColor(initialColor);
        }
    }, [initialColor]);

    useEffect(() => {
        // Update parent when color changes
        const color = colorSource === 'theme' ? themeColors[selectedThemeColor] : customColor;
        onChange(color);
    }, [colorSource, selectedThemeColor, customColor, onChange]);

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Color Source
            </Typography>
            <Select
                value={colorSource}
                onChange={(e) => setColorSource(e.target.value as 'theme' | 'custom')}
                fullWidth
                sx={{ mb: 2 }}
            >
                <MenuItem value="theme">Theme Colors</MenuItem>
                <MenuItem value="custom">Custom Color</MenuItem>
            </Select>

            {colorSource === 'theme' ? (
                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Theme Color
                    </Typography>
                    <Select
                        value={selectedThemeColor}
                        onChange={(e) => setSelectedThemeColor(e.target.value as ThemeColorKey)}
                        fullWidth
                    >
                        {(Object.entries(themeColors) as [ThemeColorKey, string][]).map(([name, color]) => (
                            <MenuItem key={name} value={name}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 1,
                                            bgcolor: color
                                        }}
                                    />
                                    {name}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            ) : (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: customColor,
                                borderRadius: 1,
                                cursor: 'pointer',
                                border: '2px solid rgba(255,255,255,0.1)'
                            }}
                        />
                        <Button
                            variant="outlined"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                        >
                            {showColorPicker ? 'Close Picker' : 'Choose Color'}
                        </Button>
                    </Box>

                    {showColorPicker && (
                        <ChromePicker
                            color={customColor}
                            onChange={(color: ColorResult) => setCustomColor(color.hex)}
                            disableAlpha
                        />
                    )}
                </Box>
            )}
        </Box>
    );
}
