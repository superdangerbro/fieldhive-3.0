'use client';

import React, { useState, useEffect } from 'react';
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
    Chip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getJobs } from '../../services/api';
import { Job, JobStatus } from '@fieldhive/shared';

interface JobsTableProps {
    refreshTrigger: number;
    onJobSelect: (job: Job | null) => void;
    selectedJob: Job | null;
    onJobsLoad: (jobs: Job[]) => void;
}

const getStatusColor = (status: JobStatus) => {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'in_progress':
            return 'info';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'error';
        default:
            return undefined;
    }
};

const defaultColumns: GridColDef[] = [
    {
        field: 'title',
        headerName: 'Title',
        flex: 1,
        minWidth: 200
    },
    {
        field: 'property',
        headerName: 'Property',
        flex: 1,
        minWidth: 200,
        valueGetter: (params) => params.value?.name || 'N/A'
    },
    {
        field: 'account',
        headerName: 'Account',
        flex: 1,
        minWidth: 200,
        valueGetter: (params) => params.value?.name || 'N/A'
    },
    {
        field: 'job_type',
        headerName: 'Type',
        width: 150,
        valueGetter: (params) => params.value?.name || 'N/A'
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => (
            <Chip
                label={params.value.replace('_', ' ').toUpperCase()}
                size="small"
                color={getStatusColor(params.value as JobStatus)}
                sx={{ color: 'white' }}
            />
        )
    },
    {
        field: 'created_at',
        headerName: 'Created',
        width: 120,
        valueGetter: (params) => new Date(params.value).toLocaleDateString()
    }
];

export default function JobsTable({ refreshTrigger, onJobSelect, selectedJob, onJobsLoad }: JobsTableProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [totalRows, setTotalRows] = useState(0);
    const [filterText, setFilterText] = useState('');
    const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns.map(col => col.field));
    const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);

    const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setColumnMenuAnchor(event.currentTarget);
    };

    const handleColumnMenuClose = () => {
        setColumnMenuAnchor(null);
    };

    const toggleColumn = (field: string) => {
        setVisibleColumns(prev => {
            if (prev.includes(field)) {
                return prev.filter(f => f !== field);
            } else {
                return [...prev, field];
            }
        });
    };

    const columns = defaultColumns
        .filter(col => visibleColumns.includes(col.field))
        .map(col => ({
            ...col,
            filterable: true
        }));

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await getJobs(page + 1, pageSize);
            setJobs(response.jobs || []);
            setTotalRows(response.total);
            onJobsLoad(response.jobs || []);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            setError('Failed to fetch jobs. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [page, pageSize, refreshTrigger]);

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Stack 
                        direction="row" 
                        spacing={2} 
                        alignItems="center"
                        justifyContent="flex-end"
                    >
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {totalRows} jobs found
                            </Typography>
                        </Box>
                        <TextField
                            label="Filter Records"
                            variant="outlined"
                            size="small"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
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
                            {defaultColumns.map((column) => (
                                <MenuItem key={column.field} onClick={() => toggleColumn(column.field)}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={visibleColumns.includes(column.field)}
                                                onChange={() => toggleColumn(column.field)}
                                            />
                                        }
                                        label={column.headerName}
                                    />
                                </MenuItem>
                            ))}
                        </Menu>
                    </Stack>
                </CardContent>
            </Card>

            <DataGrid
                rows={jobs}
                columns={columns}
                getRowId={(row) => row.job_id}
                loading={loading}
                paginationMode="server"
                page={page}
                pageSize={pageSize}
                rowCount={totalRows}
                rowsPerPageOptions={[25, 50, 100]}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                disableSelectionOnClick
                disableColumnMenu
                onRowClick={(params) => onJobSelect(params.row as Job)}
                selectionModel={selectedJob ? [selectedJob.job_id] : []}
                sx={{
                    '& .MuiDataGrid-row': {
                        cursor: 'pointer'
                    }
                }}
            />
        </Box>
    );
}
