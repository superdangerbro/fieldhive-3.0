import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Typography,
  IconButton,
  Autocomplete
} from '@mui/material';
import { Property, PropertyType, PropertyStatus, Account } from '@fieldhive/shared';
import { updateProperty, getAccounts } from '../../services/api';
import MapIcon from '@mui/icons-material/Map';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface EditPropertyDialogProps {
  open: boolean;
  property: Property | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function EditPropertyDialog({
  open,
  property,
  onClose,
  onSuccess
}: EditPropertyDialogProps) {
  const [formData, setFormData] = useState<Partial<Property>>(property || {});
  const [showMap, setShowMap] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(
    property?.accounts?.[0] ? {
      id: property.accounts[0].accountId,
      name: property.accounts[0].name
    } as Account : null
  );

  React.useEffect(() => {
    if (open) {
      setFormData(property || {});
      loadAccounts();
    }
  }, [open, property]);

  const loadAccounts = async () => {
    try {
      const response = await getAccounts();
      setAccounts(response.accounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const handleSubmit = async () => {
    if (!property?.id) return;

    try {
      await updateProperty(property.id, {
        ...formData,
        accountId: selectedAccount?.id
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update property:', error);
      alert('Failed to update property');
    }
  };

  const handleMapClick = (event: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [event.lngLat.lng, event.lngLat.lat]
      }
    }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Property</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={accounts}
              getOptionLabel={(option) => option.name}
              value={selectedAccount}
              onChange={(_, newValue) => setSelectedAccount(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Parent Account" />
              )}
            />

            <TextField
              label="Property Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />

            <TextField
              label="Address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                label="Type"
              >
                {Object.values(PropertyType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                label="Status"
              >
                {Object.values(PropertyStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Location
              </Typography>
            </Divider>

            <Stack spacing={2} direction="row" alignItems="center">
              <Stack spacing={2} flex={1}>
                <TextField
                  label="Latitude"
                  value={formData.location?.coordinates?.[1] || ''}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Longitude"
                  value={formData.location?.coordinates?.[0] || ''}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Stack>
              <IconButton 
                color="primary" 
                onClick={() => setShowMap(true)}
                sx={{ 
                  width: 48, 
                  height: 48,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <MapIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={showMap} 
        onClose={() => setShowMap(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Location</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, position: 'relative' }}>
            <Map
              initialViewState={{
                longitude: formData.location?.coordinates?.[0] || -123.1207,
                latitude: formData.location?.coordinates?.[1] || 49.2827,
                zoom: 14
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/dark-v10"
              mapboxAccessToken={MAPBOX_TOKEN}
              onClick={handleMapClick}
            >
              {formData.location?.coordinates && (
                <Marker
                  longitude={formData.location.coordinates[0]}
                  latitude={formData.location.coordinates[1]}
                  draggable
                  onDragEnd={(event) => {
                    setFormData(prev => ({
                      ...prev,
                      location: {
                        type: 'Point',
                        coordinates: [event.lngLat.lng, event.lngLat.lat]
                      }
                    }));
                  }}
                />
              )}
            </Map>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMap(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
