# Field Map Architecture

This directory contains the field map implementation, structured in a modular way to maintain code clarity and performance, with special focus on offline capabilities and field technician workflows.

## Directory Structure

```
field-map/
├── components/
│   ├── core/               # Core map functionality
│   │   ├── components/
│   │   │   └── FieldMap.tsx # Main orchestrator component
│   │   ├── BaseMap.tsx    # Base map component with essential features
│   │   └── MapControls.tsx# Map control UI (zoom, style, etc.)
│   │
│   ├── markers/           # Map markers
│   │   ├── PropertyMarker.tsx # Property location marker
│   │   └── UserLocationMarker.tsx # User location marker
│   │
│   ├── properties/        # Property-related components
│   │   └── PropertyLayer.tsx  # Property markers and interactions
│   │
│   ├── equipment/         # Equipment management
│   │   ├── EquipmentLayer.tsx # Equipment markers and interactions
│   │   └── EquipmentPlacementControls.tsx # Equipment placement UI
│   │
│   └── overlays/         # Map overlays
│       ├── FloorPlanLayer.tsx # Floor plan management
│       ├── FloorControls.tsx  # Floor plan controls
│       ├── FloorPlanDialog.tsx# Floor plan dialog
│       ├── ImageOverlay.tsx   # Image overlay utility
│       ├── FinePlacement.tsx  # Fine placement controls
│       └── RoughPlacement.tsx # Rough placement controls
│
├── hooks/                # Custom hooks
│   ├── useMapBounds.ts  # Map bounds management
│   ├── useOfflineSync.ts# Offline data synchronization
│   └── useVisitWorkflow.ts # Visit-based task management
│
├── utils/               # Utility functions
│   ├── mapHelpers.ts   # Map calculation utilities
│   └── offlineStorage.ts# IndexedDB storage management
│
└── types.ts            # TypeScript definitions
```

## Features

### Offline Support
- IndexedDB storage for map data
- Change queue for offline modifications
- Automatic sync when online
- Conflict resolution
- Progress tracking

### Visit Workflow System
- Step-by-step task guidance
- Location validation
- Required vs optional tasks
- Progress tracking
- Checklist support

### Map Functionality
- Property and equipment visualization
- Floor plan overlays
- Geolocation tracking
- Bounds-based data loading
- Custom controls

## Usage Examples

### Offline Data Management
```typescript
import { useOfflineSync } from './hooks';

const MyComponent = () => {
  const { 
    isOnline,
    saveOfflineData,
    syncQueue 
  } = useOfflineSync({
    syncInterval: 30000,
    onSyncComplete: () => console.log('Sync completed')
  });

  // Handle offline data
  const handleSave = async (data) => {
    await saveOfflineData(data);
  };
};
```

### Visit Workflow
```typescript
import { useVisitWorkflow } from './hooks';

const VisitComponent = ({ visit }) => {
  const {
    currentTask,
    completeTask,
    progress,
    validateLocation
  } = useVisitWorkflow({
    visit,
    onTaskComplete: (task) => console.log('Task completed:', task)
  });

  // Guide technician through tasks
  const handleTaskCompletion = async () => {
    if (currentTask.location) {
      const isValid = await validateLocation(userLocation, currentTask.location);
      if (!isValid) return;
    }
    await completeTask();
  };
};
```

### Map Components
```typescript
import { FieldMap } from './components/core';
import { PropertyMarker } from './components/markers';
import { FloorPlanLayer } from './components/overlays';

// Main map component
const MapPage = () => (
  <FieldMap />
);

// Individual markers
const CustomMarker = () => (
  <PropertyMarker
    property={propertyData}
    onClick={handleClick}
  />
);

// Floor plan overlay
const FloorPlanView = () => (
  <FloorPlanLayer
    mapRef={mapRef}
    selectedPropertyId={propertyId}
  />
);
```

## Performance Considerations

1. **Data Loading**
   - Bounds-based data fetching
   - Lazy loading of markers
   - Data caching in IndexedDB

2. **Rendering**
   - Component code splitting
   - Conditional rendering
   - Memoization of expensive calculations

3. **Offline Support**
   - Efficient IndexedDB operations
   - Batched sync operations
   - Change queue management

4. **Mobile Optimization**
   - Touch-friendly controls
   - Reduced network usage
   - Efficient memory management

## Development Guidelines

1. **Adding New Features**
   - Place components in appropriate subdirectories
   - Create necessary hooks and utilities
   - Update types as needed
   - Document usage examples

2. **State Management**
   - Use hooks for local state
   - Keep state close to where it's used
   - Minimize prop drilling
   - Use context sparingly

3. **Error Handling**
   - Graceful degradation
   - Clear error messages
   - Retry mechanisms
   - Error boundaries

4. **Testing**
   - Unit tests for utilities
   - Component testing
   - Integration tests
   - Mobile testing

## Future Improvements

1. **Offline Capabilities**
   - Better conflict resolution
   - Partial sync support
   - Background sync
   - Progress indicators

2. **Visit Workflow**
   - Custom task types
   - Dynamic checklists
   - Time tracking
   - Photo attachments

3. **Map Features**
   - Clustering improvements
   - Custom overlay support
   - Advanced filtering
   - Route optimization

4. **Performance**
   - Virtual rendering
   - WebGL acceleration
   - Worker offloading
   - Better caching

## Contributing

1. Follow the directory structure
2. Add appropriate documentation
3. Include usage examples
4. Consider offline use cases
5. Test on mobile devices
6. Update relevant README sections
