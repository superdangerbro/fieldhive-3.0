import { Theme } from '@mui/material';

export const fieldMap3dStyles = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex',
    height: '100%',
    position: 'relative',
    bgcolor: theme.palette.background.default,
    '& .mapboxgl-map': {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    '& .mapboxgl-ctrl-logo': {
      display: 'none'
    }
  },
  errorContainer: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    bgcolor: theme.palette.background.default,
  },
  searchMarker: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    bgcolor: 'info.main',
    border: '2px solid white',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.2)'
    }
  },
  propertyMarker: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    bgcolor: 'primary.main',
    border: '3px solid white',
    boxShadow: theme.shadows[3]
  },
  controlButton: {
    position: 'absolute',
    top: 24,
    backgroundColor: theme.palette.background.paper,
    '&:hover': { 
      backgroundColor: theme.palette.action.hover 
    },
    boxShadow: theme.shadows[2],
    zIndex: 1000,
  },
  locationButton: {
    right: 160,
  },
  threeDButton: {
    right: 90,
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    zIndex: 1000,
    width: 72,
    height: 72,
  },
  addButtonIcon: {
    fontSize: 36
  }
});
