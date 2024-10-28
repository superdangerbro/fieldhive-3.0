'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    Typography
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getJobs, updateJob, deleteJob } from '../../services/api';

interface Job {
    job_id: string;
    job_type: {
        job_type_id: string;
        name: string;
    };
    property: {
        property_id: string;
        name: string;
        address: string;
    };
    account: {
        account_id: string;
        name: string;
    } | null;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface EditDialogProps {
    open: boolean;
    job: Job | null;
    onClose: () => void;
    onSave: (jobId: string, data: { status: string; notes?: string }) => void;
}

const jobStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

const EditDialog: React.FC<EditDialogProps> = ({ open, job, onClose, onSave }) => {
    const [status, setStatus] = useState(job?.status || 'pending');
    const [notes, setNotes] = useState(job?.notes || '');

    useEffect(() => {
        if (job) {
            setStatus(job.status);
            setNotes(job.notes || '');
        }
    }, [job]);

    const handleSave = () => {
        if (job) {
            onSave(job.job_id, { status, notes });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                        select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        fullWidth
                    >
                        {jobStatuses.map((s) => (
                            <MenuItem key={s} value={s}>
                                {s.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default function JobsTable() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editJob, setEditJob] = useState<Job | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const columns: GridColDef[] = [
        {
            field: 'job_type',
            headerName: 'Job Type',
            flex: 1,
            minWidth: 150,
            valueGetter: (params) => params.value.name
        },
        {
            field: 'account',
            headerName: 'Account',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                const account = params.value;
                if (!account) {
                    return <Typography color="text.secondary">No Account</Typography>;
                }
                return account.name;
            }
        },
        {
            field: 'property',
            headerName: 'Property',
            flex: 1,
            minWidth: 200,
            valueGetter: (params) => `${params.value.name} (${params.value.address})`
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            valueFormatter: (params) => 
                params.value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        },
        {
            field: 'created_at',
            headerName: 'Created',
            width: 180,
            valueGetter: (params) => new Date(params.value).toLocaleDateString()
        },
        {
            field: 'updated_at',
            headerName: 'Last Updated',
            width: 180,
            valueGetter: (params) => new Date(params.value).toLocaleDateString()
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Edit Job">
                        <IconButton
                            onClick={() => setEditJob(params.row)}
                            size="small"
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Job">
                        <IconButton
                            onClick={() => handleDeleteJob(params.row.job_id)}
                            size="small"
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    const fetchJobs = async () => {
        try {
            console.log('Fetching jobs with page:', page + 1, 'pageSize:', pageSize);
            setLoading(true);
            const response = await getJobs(page + 1, pageSize);
            console.log('Jobs response:', response);
            setJobs(response.jobs);
            setTotalRows(response.total);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            setError('Failed to fetch jobs. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('JobsTable useEffect triggered');
        fetchJobs();
    }, [page, pageSize, refreshTrigger]);

    // Listen for jobsUpdated event
    useEffect(() => {
        const handleJobsUpdated = () => {
            console.log('Jobs updated event received');
            setRefreshTrigger(prev => prev + 1);
        };

        window.addEventListener('jobsUpdated', handleJobsUpdated);
        return () => {
            window.removeEventListener('jobsUpdated', handleJobsUpdated);
        };
    }, []);

    const handleUpdateJob = async (jobId: string, data: { status: string; notes?: string }) => {
        try {
            await updateJob(jobId, data);
            setEditJob(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Failed to update job:', error);
            setError('Failed to update job. Please try again later.');
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!window.confirm('Are you sure you want to delete this job?')) {
            return;
        }

        try {
            await deleteJob(jobId);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Failed to delete job:', error);
            setError('Failed to delete job. Please try again later.');
        }
    };

    if (loading && jobs.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 435 }}>
                <Typography>Loading jobs...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: 435, width: '100%' }}>
            <DataGrid
                rows={jobs}
                columns={columns}
                getRowId={(row) => row.job_id}
                rowCount={totalRows}
                loading={loading}
                paginationMode="server"
                page={page}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
            />

            <EditDialog
                open={!!editJob}
                job={editJob}
                onClose={() => setEditJob(null)}
                onSave={handleUpdateJob}
            />

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}
