'use client';

import React, { useState } from 'react';
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
    Chip,
    Alert,
    Button
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { Job, JobStatus } from '../../../globalTypes/job';
import { useJobs } from '../hooks/useJobs';
import { useSetting } from '../hooks/useSettings';

interface JobsTableProps {
    onJobSelect: (job: Job | null) => void;
    selectedJob: Job | null;
    onJobsLoad?: (jobs: Job[]) => void;
}

// Helper function to convert snake_case to Title Case
const toTitleCase = (str: string | null | undefined): string => {
    if (!str) return 'N/A';
    try {
        return str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    } catch (error) {
        console.error('Error in toTitleCase:', error);
        return str;
    }
};

const defaultColumns: GridColDef<Job>[] = [
    {
        field: 'title',
        headerName: 'Title',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => params.row.title || 'N/A'
    },
    {
        field: 'property',
        headerName: 'Property',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => params.row.property?.name || 'N/A'
    },
    {
        field: 'accounts',
        headerName: 'Accounts',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => {
            const accounts = params.row.property?.accounts || [];
            if (!accounts || accounts.length === 0) return 'N/A';
            
            if (accounts.length === 1) {
                return accounts[0].name;
            }

            return (
                <Stack direction="row" spacing={1}>
                    <Typography>{accounts[0].name}</Typography>
                    {accounts.length > 1 && (
                        <Chip 
                            label={`+${accounts.length - 1}`} 
                            size="small"
                            sx={{ ml: 1 }}
                        />
                    )}
                </Stack>
            );
        }
    },
    {
        field: 'job_type_id',
        headerName: 'Type',
        width: 150,
        renderCell: (params) => toTitleCase(params.row.job_type_id)
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => {
            const currentStatus = params.row.status;
            const { data: statusSettings } = useSetting<{ statuses: JobStatus[] }>('job_statuses');
            
            // Find matching status from settings
            const statusConfig = statusSettings?.statuses?.find(s => s.value === currentStatus);
            
            return (
                <Chip
                    label={statusConfig?.label || toTitleCase(currentStatus)}
                    size="small"
                    sx={{ 
                        bgcolor: statusConfig?.color || '#757575', // Default gray if no color found
                        color: 'white'
                    }}
                />
            );
        }
    },
    {
        field: 'created_at',
        headerName: 'Created',
        width: 120,
        renderCell: (params) => {
            const date = params.row.created_at;
            return date ? new Date(date).toLocaleDateString() : 'N/A';
        }
    }
];

export function JobsTable({ onJobSelect, selectedJob, onJobsLoad }: JobsTableProps) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [filterText, setFilterText] = useState('');
    const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns.map(col => col.field));
    const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);

    const { 
        data = { jobs: [], total: 0 }, 
        isLoading,
        error,
        refetch
    } = useJobs();

    // Fetch job statuses for filtering
    const { data: statusSettings } = useSetting<{ statuses: JobStatus[] }>('job_statuses');

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

    // Filter jobs based on search text
    const filteredJobs = React.useMemo(() => {
        if (!filterText) return data.jobs;
        
        const searchText = filterText.toLowerCase();
        return data.jobs.filter((job: Job) => {
            const statusConfig = statusSettings?.statuses?.find(s => s.value === job.status);
            const statusLabel = statusConfig?.label || toTitleCase(job.status);
            
            return (
                job.title?.toLowerCase().includes(searchText) ||
                job.property?.name?.toLowerCase().includes(searchText) ||
                job.property?.accounts?.some((account) => 
                    account.name.toLowerCase().includes(searchText)
                ) ||
                job.job_type_id?.toLowerCase().includes(searchText) ||
                statusLabel.toLowerCase().includes(searchText)
            );
        });
    }, [data.jobs, filterText, statusSettings]);

    // Call onJobsLoad when jobs are loaded
    React.useEffect(() => {
        if (onJobsLoad && data.jobs.length > 0) {
            onJobsLoad(data.jobs);
        }
    }, [data.jobs, onJobsLoad]);

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
                                {data.total} jobs found
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

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => refetch()}>
                            Try Again
                        </Button>
                    }
                >
                    {error instanceof Error ? error.message : 'Failed to load jobs'}
                </Alert>
            )}

            <DataGrid<Job>
                rows={filterText ? filteredJobs : data.jobs}
                columns={columns}
                getRowId={(row) => row.job_id}
                loading={isLoading}
                paginationMode="server"
                rowCount={data.total}
                pageSizeOptions={[25, 50, 100]}
                onPaginationModelChange={(model) => {
                    setPage(model.page);
                    setPageSize(model.pageSize);
                }}
                paginationModel={{ page, pageSize }}
                disableRowSelectionOnClick
                disableColumnMenu
                onRowClick={(params) => onJobSelect(params.row)}
                rowSelectionModel={selectedJob ? [selectedJob.job_id] : []}
                sx={{
                    '& .MuiDataGrid-row': {
                        cursor: 'pointer'
                    }
                }}
                slots={{
                    noRowsOverlay: () => (
                        <Stack height="100%" alignItems="center" justifyContent="center">
                            <Typography color="text.secondary">
                                {isLoading ? 'Loading...' : 'No jobs found'}
                            </Typography>
                        </Stack>
                    )
                }}
            />
        </Box>
    );
}
