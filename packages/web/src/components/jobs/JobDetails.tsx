'use client';

import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Tabs,
    Tab,
    Chip,
    IconButton,
    Collapse
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Job } from '@fieldhive/shared';

interface JobDetailsProps {
    job: Job | null;
    onEdit: (job: Job) => void;
    onUpdate: () => void;
    onJobSelect: (job: Job | null) => void;
}

export default function JobDetails({ job, onEdit, onUpdate, onJobSelect }: JobDetailsProps) {
    const [expanded, setExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
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

    return (
        <Paper sx={{ mb: 2 }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {job ? (
                        <>
                            <Typography variant="h6">{job.title}</Typography>
                            <Chip 
                                label={job.status.replace('_', ' ').toUpperCase()} 
                                color={getStatusColor(job.status)}
                                size="small"
                            />
                        </>
                    ) : (
                        <Typography variant="h6" color="text.secondary">No Job Selected</Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {job && (
                        <Button
                            startIcon={<EditIcon />}
                            onClick={() => onEdit(job)}
                            variant="outlined"
                            size="small"
                        >
                            Edit
                        </Button>
                    )}
                    <IconButton
                        onClick={() => setExpanded(!expanded)}
                        size="small"
                    >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={expanded}>
                {job ? (
                    <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={activeTab} onChange={handleTabChange}>
                                <Tab label="Details" />
                                <Tab label="Activity" />
                                <Tab label="Documents" />
                            </Tabs>
                        </Box>

                        <Box sx={{ p: 2 }}>
                            {activeTab === 0 && (
                                <Box sx={{ display: 'grid', gap: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">Property</Typography>
                                        <Typography>{job.property?.name || 'N/A'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                        <Typography>{job.description || 'No description'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                                        <Typography>{new Date(job.createdAt).toLocaleDateString()}</Typography>
                                    </Box>
                                </Box>
                            )}
                            {activeTab === 1 && (
                                <Typography color="text.secondary">No activity recorded</Typography>
                            )}
                            {activeTab === 2 && (
                                <Typography color="text.secondary">No documents attached</Typography>
                            )}
                        </Box>
                    </>
                ) : (
                    <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary">
                            Select a job to view its details or create a new job to get started.
                        </Typography>
                    </Box>
                )}
            </Collapse>
        </Paper>
    );
}
