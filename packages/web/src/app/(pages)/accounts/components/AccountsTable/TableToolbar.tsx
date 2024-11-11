'use client';

import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Checkbox, 
  FormControlLabel, 
  Stack, 
  Typography,
  Button
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import type { GridColDef } from '@mui/x-data-grid';

interface TableToolbarProps {
  totalCount: number;
  selectedCount: number;
  filterText: string;
  onFilterChange: (value: string) => void;
  onDeleteSelected: () => void;
  columns: GridColDef[];
  visibleColumns: string[];
  onToggleColumn: (field: string) => void;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  totalCount,
  selectedCount,
  filterText,
  onFilterChange,
  onDeleteSelected,
  columns,
  visibleColumns,
  onToggleColumn,
}) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center"
          justifyContent="flex-end"
        >
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {totalCount} accounts found
              </Typography>
              {selectedCount > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={onDeleteSelected}
                >
                  Delete Selected ({selectedCount})
                </Button>
              )}
            </Stack>
          </Box>
          <TextField
            label="Filter Records"
            variant="outlined"
            size="small"
            value={filterText}
            onChange={(e) => onFilterChange(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <FilterListIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
          <Tooltip title="Select Columns">
            <IconButton 
              onClick={handleColumnMenuOpen}
              sx={{ ml: 1 }}
            >
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
            {columns.map((column) => (
              <MenuItem 
                key={column.field} 
                onClick={() => onToggleColumn(column.field)}
                sx={{ padding: 0 }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={visibleColumns.includes(column.field)}
                      onChange={() => onToggleColumn(column.field)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                  label={column.headerName}
                  sx={{ width: '100%', padding: '6px 16px', margin: 0 }}
                />
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </CardContent>
    </Card>
  );
};
