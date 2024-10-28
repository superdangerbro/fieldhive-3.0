'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface AddEquipmentDialogProps {
  open: boolean;
  location: [number, number];
  onClose: () => void;
  onSubmit: (data: { jobId: string; equipmentTypeId: string }) => Promise<void>;
}

interface Job {
  job_id: string;
  job_type: {
    name: string;
  };
  property: {
    name: string;
    address: string;
  };
}

interface EquipmentType {
  equipment_type_id: string;
  name: string;
}

export function AddEquipmentDialog({
  open,
  location,
  onClose,
  onSubmit,
}: AddEquipmentDialogProps) {
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedJob('');
      setSelectedEquipmentType('');
      setError(null);
    }
  }, [open]);

  // Fetch jobs and equipment types when dialog opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [jobsResponse, typesResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/jobs?page=1&pageSize=100`).then(res => {
              if (!res.ok) throw new Error('Failed to fetch jobs');
              return res.json();
            }),
            fetch(`${API_BASE_URL}/equipment-types`).then(res => {
              if (!res.ok) throw new Error('Failed to fetch equipment types');
              return res.json();
            })
          ]);
          setJobs(jobsResponse.jobs);
          setEquipmentTypes(typesResponse);
        } catch (err) {
          console.error('Failed to fetch data:', err);
          setError(err instanceof Error ? err.message : 'Failed to load required data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !selectedEquipmentType) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        jobId: selectedJob,
        equipmentTypeId: selectedEquipmentType
      });
      setSelectedJob('');
      setSelectedEquipmentType('');
    } catch (err) {
      console.error('Failed to add equipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to add equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          background: (theme) => theme.palette.background.default,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Add Equipment</Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Location: {location[0].toFixed(6)}, {location[1].toFixed(6)}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth>
            <InputLabel>Job</InputLabel>
            <Select
              value={selectedJob}
              label="Job"
              onChange={(e) => setSelectedJob(e.target.value)}
              disabled={isSubmitting}
            >
              {jobs.map((job) => (
                <MenuItem key={job.job_id} value={job.job_id}>
                  {job.property.name} - {job.job_type.name}
                  <Typography variant="caption" component="div" color="text.secondary">
                    {job.property.address}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Equipment Type</InputLabel>
            <Select
              value={selectedEquipmentType}
              label="Equipment Type"
              onChange={(e) => setSelectedEquipmentType(e.target.value)}
              disabled={isSubmitting}
            >
              {equipmentTypes.map((type) => (
                <MenuItem key={type.equipment_type_id} value={type.equipment_type_id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          fullWidth
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          disabled={!selectedJob || !selectedEquipmentType || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Adding Equipment...' : 'Add Equipment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
