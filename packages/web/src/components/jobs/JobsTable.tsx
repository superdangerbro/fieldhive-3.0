'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    InputAdornment
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
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
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [editJob, setEditJob] = useState<Job | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: Job) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedJob(job);
    };

    const handleHeaderMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setHeaderAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setHeaderAnchorEl(null);
        setSelectedJob(null);
    };

    const handleEdit = () => {
        if (selectedJob) {
            setEditJob(selectedJob);
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        if (selectedJob) {
            handleDeleteJob(selectedJob.job_id);
        }
        handleMenuClose();
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await getJobs(1, 100); // Simplified pagination for now
            setJobs(response.jobs || []);
            setFilteredJobs(response.jobs || []);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            setError('Failed to fetch jobs. Please try again later.');
            setJobs([]);
            setFilteredJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [refreshTrigger]);

    useEffect(() => {
        const filtered = jobs.filter(job => {
            const searchLower = searchQuery.toLowerCase();
            return (
                job.job_type?.name?.toLowerCase().includes(searchLower) ||
                job.account?.name?.toLowerCase().includes(searchLower) ||
                job.property?.name?.toLowerCase().includes(searchLower) ||
                job.property?.address?.toLowerCase().includes(searchLower) ||
                job.status?.toLowerCase().includes(searchLower)
            );
        });
        setFilteredJobs(filtered);
    }, [searchQuery, jobs]);

    const handleUpdateJob = async (jobId: string, data: { status: string; notes?: string }) => {
        try {
            await updateJob(jobId, data);
            setEditJob(null);
            setRefreshTrigger(prev => prev + 1);
            setError(null);
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
            setError(null);
        } catch (error) {
            console.error('Failed to delete job:', error);
            setError('Failed to delete job. Please try again later.');
        }
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                <TextField
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ 
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            },
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <IconButton onClick={handleRefresh} size="small">
                    <RefreshIcon />
                </IconButton>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth: 150 }}>
                                Job Type
                                <IconButton size="small" onClick={handleHeaderMenuOpen} sx={{ ml: 1 }}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                            <TableCell sx={{ minWidth: 150 }}>
                                Account
                                <IconButton size="small" onClick={handleHeaderMenuOpen} sx={{ ml: 1 }}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                            <TableCell sx={{ minWidth: 200 }}>
                                Property
                                <IconButton size="small" onClick={handleHeaderMenuOpen} sx={{ ml: 1 }}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                            <TableCell sx={{ minWidth: 130 }}>
                                Status
                                <IconButton size="small" onClick={handleHeaderMenuOpen} sx={{ ml: 1 }}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                            <TableCell sx={{ minWidth: 130 }}>
                                Created
                                <IconButton size="small" onClick={handleHeaderMenuOpen} sx={{ ml: 1 }}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                            <TableCell width="50px"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredJobs.map((job) => (
                            <TableRow key={job.job_id}>
                                <TableCell>{job.job_type?.name || 'Unknown'}</TableCell>
                                <TableCell>{job.account?.name || 'No Account'}</TableCell>
                                <TableCell>{job.property ? `${job.property.name} (${job.property.address})` : 'Unknown'}</TableCell>
                                <TableCell>
                                    {job.status?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown'}
                                </TableCell>
                                <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={(event) => handleMenuOpen(event, job)}
                                            sx={{ color: 'text.secondary', p: 0 }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                                            </Box>
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleEdit}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>

            <Menu
                anchorEl={headerAnchorEl}
                open={Boolean(headerAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleMenuClose}>Sort Ascending</MenuItem>
                <MenuItem onClick={handleMenuClose}>Sort Descending</MenuItem>
                <MenuItem onClick={handleMenuClose}>Hide Column</MenuItem>
            </Menu>

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
