'use client';

import React from 'react';
import { 
    Box, 
    Button, 
    CardContent, 
    IconButton, 
    Stack, 
    TextField, 
    Tooltip, 
    Typography,
    Menu,
    MenuItem,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import type { GridColDef } from '@mui/x-data-grid';

interface PropertiesTableToolbarProps {
    filterText: string;
    onFilterChange: (value: string) => void;
    totalProperties: number;
    selectedCount: number;
    onDeleteSelected: () => void;
    onAddProperty: () => void;
    isLoading: boolean;
    visibleColumns: string[];
    onToggleColumn: (field: string) => void;
    availableColumns: GridColDef[];
}

export function PropertiesTableToolbar({
    filterText,
    onFilterChange,
    totalProperties,
    selectedCount,
    onDeleteSelected,
    onAddProperty,
    isLoading,
    visibleColumns,
    onToggleColumn,
    availableColumns
}: PropertiesTableToolbarProps) {
    const [columnMenuAnchor, setColumnMenuAnchor] = React.useState<null | HTMLElement>(null);

    const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setColumnMenuAnchor(event.currentTarget);
    };

    const handleColumnMenuClose = () => {
        setColumnMenuAnchor(null);
    };

    return (
        <CardContent>
            <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center"
            >
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <TextField
                        placeholder="Search properties..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={filterText}
                        onChange={(e) => onFilterChange(e.target.value)}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {totalProperties} properties found
                </Typography>
                {selectedCount > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={onDeleteSelected}
                        disabled={isLoading}
                    >
                        Delete Selected ({selectedCount})
                    </Button>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={onAddProperty}
                    disabled={isLoading}
                >
                    Add Property
                </Button>
                <Tooltip title="Select Columns">
                    <IconButton onClick={handleColumnMenuOpen}>
                        <ViewColumnIcon />
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={columnMenuAnchor}
                    open={Boolean(columnMenuAnchor)}
                    onClose={handleColumnMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {availableColumns.map((column) => (
                        <MenuItem key={column.field} onClick={() => onToggleColumn(column.field)}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={visibleColumns.includes(column.field)}
                                        onChange={() => onToggleColumn(column.field)}
                                    />
                                }
                                label={column.headerName}
                            />
                        </MenuItem>
                    ))}
                </Menu>
            </Stack>
        </CardContent>
    );
}
