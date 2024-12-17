export function LayersControl({ propertyFilters, onPropertyFiltersChange }: LayersControlProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 80,
        left: 16,
        zIndex: 1500,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        p: 1,
        boxShadow: 2,
        minWidth: 200,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Layers</Typography>
      <Stack spacing={1}>
        <FormGroup>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
            Status
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={propertyFilters.statuses.includes('active')}
                onChange={(e) => {
                  const newStatuses = e.target.checked
                    ? [...propertyFilters.statuses, 'active']
                    : propertyFilters.statuses.filter(s => s !== 'active');
                  onPropertyFiltersChange({ ...propertyFilters, statuses: newStatuses });
                }}
              />
            }
            label="Active Properties"
          />
          <FormControlLabel
            control={
              <Switch
                checked={propertyFilters.statuses.includes('inactive')}
                onChange={(e) => {
                  const newStatuses = e.target.checked
                    ? [...propertyFilters.statuses, 'inactive']
                    : propertyFilters.statuses.filter(s => s !== 'inactive');
                  onPropertyFiltersChange({ ...propertyFilters, statuses: newStatuses });
                }}
              />
            }
            label="Inactive Properties"
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, mb: 0.5 }}>
            Type
          </Typography>
          {['residential', 'commercial', 'industrial', 'agricultural'].map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Switch
                  checked={propertyFilters.types.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...propertyFilters.types, type]
                      : propertyFilters.types.filter(t => t !== type);
                    onPropertyFiltersChange({ ...propertyFilters, types: newTypes });
                  }}
                />
              }
              label={type.charAt(0).toUpperCase() + type.slice(1)}
            />
          ))}
        </FormGroup>
      </Stack>
    </Box>
  );
} 