'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  CircularProgress,
  DialogActions,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { useJobs } from '../../../jobs/hooks/useJobs';
import { useActiveJobContext } from '../../../../../app/globalHooks/useActiveJobContext';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import type { Job } from '../../../../../app/globalTypes/job';
import type { Property } from '../../../../../app/globalTypes/property';

interface SelectJobDialogProps {
  open: boolean;
  onClose: () => void;
  onJobSelect?: (job: Job) => void;
  userLocation?: [number, number];
}

type TabValue = 'nearby' | 'search';

export function SelectJobDialog({ open, onClose, onJobSelect, userLocation }: SelectJobDialogProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('nearby');
  const [searchTerm, setSearchTerm] = useState('');
  const { setActiveJob, setActiveProperty, activeProperty } = useActiveJobContext();

  // If we already have an activeProperty from the map, use it immediately
  useEffect(() => {
    if (open && activeProperty && !selectedProperty) {
      setSelectedProperty(activeProperty);
    }
  }, [open, activeProperty, selectedProperty]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setActiveTab('nearby');
      // Don't reset selectedProperty here as it should persist
    }
  }, [open]);

  // Query for nearby properties
  const {
    data: nearbyProperties = [],
    isLoading: isLoadingNearby,
    error: nearbyError
  } = useQuery({
    queryKey: ['nearby-properties', userLocation],
    queryFn: async () => {
      // Create a bounding box around the user's location (2km radius ≈ 0.02 degrees)
      const radius = 0.02;
      const [longitude, latitude] = userLocation || [0, 0];
      const params = new URLSearchParams({
        bounds: `${longitude - radius},${latitude - radius},${longitude + radius},${latitude + radius}`
      });

      const url = `${ENV_CONFIG.api.baseUrl}/properties?${params}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.properties || [];
    },
    enabled: open && activeTab === 'nearby',
    staleTime: 30000
  });

  // Query for searched properties
  const {
    data: searchedProperties = [],
    isLoading: isLoadingSearch,
    error: searchError
  } = useQuery({
    queryKey: ['properties-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      const params = new URLSearchParams({
        search: searchTerm
      });

      const url = `${ENV_CONFIG.api.baseUrl}/properties/search?${params}`;
      console.log('Searching properties with URL:', url);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to search properties:', errorText);
          throw new Error(`Failed to search properties: ${errorText}`);
        }
        const data = await response.json();
        console.log('Received search results:', data);
        return data;
      } catch (error) {
        console.error('Error searching properties:', error);
        throw error;
      }
    },
    enabled: searchTerm.length >= 3 && activeTab === 'search'
  });

  // Query for property jobs using the updated useJobs hook
  const {
    data: jobsData,
    isLoading: isLoadingJobs
  } = useJobs(
    selectedProperty ? { property_id: selectedProperty.property_id } : undefined
  );

  const propertyJobs = jobsData?.jobs || [];

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    setActiveProperty(property);
  }, [setActiveProperty]);

  const handleJobSelect = useCallback((job: Job) => {
    setActiveJob(job);
    if (onJobSelect) {
      onJobSelect(job);
    }
    onClose();
  }, [setActiveJob, onJobSelect, onClose]);

  const handleBack = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  const renderNearbyContent = () => {
    if (isLoadingNearby) {
      return (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      );
    }

    if (nearbyError) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          Error loading properties
        </Alert>
      );
    }

    if (!nearbyProperties?.length) {
      return (
        <Box p={2}>
          <Typography>No properties found within 2km</Typography>
        </Box>
      );
    }

    return (
      <List>
        {nearbyProperties.map((property) => (
          <ListItem key={property.property_id} disablePadding>
            <ListItemButton onClick={() => handlePropertyClick(property)}>
              <ListItemText 
                primary={property.name || 'Unnamed Property'}
                secondary={property.address}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderJobList = (jobs: Job[]) => (
    <List sx={{ mt: 2 }}>
      {jobs.map((job) => (
        <ListItem 
          key={job.job_id}
          disablePadding
          sx={{ mb: 1 }}
        >
          <ListItemButton
            onClick={() => handleJobSelect(job)}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{job.title}</Typography>
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedProperty && (
              <IconButton edge="start" onClick={handleBack} aria-label="back">
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6">
              {selectedProperty ? 'Select Job' : 'Select Property'}
            </Typography>
          </Box>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        {selectedProperty && (
          <Breadcrumbs sx={{ mt: 1 }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleBack}
              underline="hover"
              sx={{ cursor: 'pointer' }}
            >
              Properties
            </Link>
            <Typography variant="body2" color="text.primary">
              {selectedProperty.name}
            </Typography>
          </Breadcrumbs>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {!selectedProperty && (
            <>

              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                <Tab 
                  value="nearby" 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon sx={{ mr: 1 }} />
                      Nearby Properties
                    </Box>
                  }
                />
                <Tab 
                  value="search" 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SearchIcon sx={{ mr: 1 }} />
                      Search Properties
                    </Box>
                  }
                />
              </Tabs>

              {activeTab === 'nearby' && (
                renderNearbyContent()
              )}

              {activeTab === 'search' && (
                <>

                  <TextField
                    fullWidth
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: isLoadingSearch ? (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null
                    }}
                  />

                  {searchTerm && searchTerm.length < 3 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Enter at least 3 characters to search
                    </Typography>
                  )}

                  {searchError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {searchError instanceof Error ? searchError.message : 'Failed to search properties'}
                    </Alert>
                  )}

                  {searchTerm.length >= 3 && (
                    <>

                      {isLoadingSearch ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : searchedProperties.length > 0 ? (
                        <List>
                          {searchedProperties.map((property) => (
                            <ListItem key={property.property_id} disablePadding>
                              <ListItemButton onClick={() => handlePropertyClick(property)}>
                                <ListItemText 
                                  primary={property.name || 'Unnamed Property'}
                                  secondary={property.address}
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                          No properties found matching your search
                        </Typography>
                      )}
                    </>

                  )}
                </>

              )}
            </>

          )}

          {selectedProperty && (
            <>

              {isLoadingJobs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : propertyJobs.length > 0 ? (
                renderJobList(propertyJobs)
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  No active jobs found for this property
                </Typography>
              )}
            </>

          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
