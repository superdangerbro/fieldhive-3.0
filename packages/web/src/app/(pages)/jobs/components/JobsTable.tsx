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
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { Job, JobStatus } from '../../../globalTypes';
import { useJobs } from '../hooks/useJobs';

interface JobsTableProps {
    onJobSelect: (job: Job | null) => void;
    selectedJob: Job | null;
    onJobsLoad?: (jobs: Job[]) => void;
}

const defaultColumns: GridColDef[] = [
    {
        field: 'name',
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
        valueGetter: (params) => params.row.property?.accounts?.[0]?.name || 'N/A'
    },
    {
        field: 'type',
        headerName: 'Type',
        width: 150,
        valueGetter: (params) => params.row.jobType?.name || 'N/A'
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => {
            const status = params.value as JobStatus;
            return (
                <Chip
                    label={typeof status === 'string' ? status : status.name}
                    size="small"
                    sx={{ 
                        bgcolor: typeof status === 'string' ? 'primary.main' : status.color,
                        color: 'white'
                    }}
                />
            );
        }
    },
    {
        field: 'createdAt',
        headerName: 'Created',
        width: 120,
        valueGetter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    }
];

export function JobsTable({ onJobSelect, selectedJob, onJobsLoad }: JobsTableProps) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [filterText, setFilterText] = useState('');
    const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns.map(col => col.field));
    const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);

    // Use React Query for data fetching
    const { 
        data = { jobs: [], total: 0 }, 
        isLoading,
        error,
        refetch
    } = useJobs();

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
            const statusText = typeof job.status === 'object' ? job.status.name : job.status;
            return (
                job.name?.toLowerCase().includes(searchText) ||
                job.property?.name?.toLowerCase().includes(searchText) ||
                job.property?.accounts?.some(account => 
                    account.name.toLowerCase().includes(searchText)
                ) ||
                job.jobType?.name?.toLowerCase().includes(searchText) ||
                statusText.toLowerCase().includes(searchText)
            );
        });
    }, [data.jobs, filterText]);

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

            <DataGrid
                rows={filterText ? filteredJobs : data.jobs}
                columns={columns}
                getRowId={(row) => row.jobId}
                loading={isLoading}
                paginationMode="server"
                page={page}
                pageSize={pageSize}
                rowCount={data.total}
                rowsPerPageOptions={[25, 50, 100]}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                disableSelectionOnClick
                disableColumnMenu
                onRowClick={(params) => onJobSelect(params.row as Job)}
                selectionModel={selectedJob ? [selectedJob.jobId] : []}
                sx={{
                    '& .MuiDataGrid-row': {
                        cursor: 'pointer'
                    }
                }}
                components={{
                    NoRowsOverlay: () => (
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
