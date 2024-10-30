'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Menu,
    MenuItem,
    Chip,
    Typography,
    CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getJobs, deleteJob } from '../../services/api';
import { Job } from '@fieldhive/shared';

interface JobsTableProps {
    refreshTrigger: number;
    onJobSelect: (job: Job | null) => void;
    selectedJob: Job | null;
    onJobsLoad: (jobs: Job[]) => void;
}

export default function JobsTable({ refreshTrigger, onJobSelect, selectedJob, onJobsLoad }: JobsTableProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedActionJob, setSelectedActionJob] = useState<Job | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    useEffect(() => {
        fetchJobs();
    }, [refreshTrigger, page, pageSize]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await getJobs(page, pageSize);
            setJobs(response.jobs || []);
            onJobsLoad(response.jobs || []);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            setError('Failed to fetch jobs. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: Job) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedActionJob(job);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedActionJob(null);
    };

    const handleDelete = async () => {
        if (!selectedActionJob) return;

        if (!window.confirm('Are you sure you want to delete this job?')) {
            handleMenuClose();
            return;
        }

        try {
            await deleteJob(selectedActionJob.id);
            fetchJobs();
            if (selectedJob?.id === selectedActionJob.id) {
                onJobSelect(null);
            }
        } catch (error) {
            console.error('Failed to delete job:', error);
        }
        handleMenuClose();
    };

    const getStatusColor = (status: string) => {
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
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Property</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell width={50}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow
                                key={job.id}
                                hover
                                selected={selectedJob?.id === job.id}
                                onClick={() => onJobSelect(job)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell>
                                    <Typography variant="body1">{job.title}</Typography>
                                </TableCell>
                                <TableCell>{job.property?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={job.status.replace('_', ' ').toUpperCase()}
                                        color={getStatusColor(job.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, job)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
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
            >
                <MenuItem onClick={() => {
                    if (selectedActionJob) {
                        onJobSelect(selectedActionJob);
                    }
                    handleMenuClose();
                }}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>
        </Paper>
    );
}
