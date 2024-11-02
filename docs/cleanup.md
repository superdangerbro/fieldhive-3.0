# Migration and Cleanup Plan

This document outlines the plan for migrating components and services to the new app structure. **No files will be deleted until the new structure is thoroughly tested and verified working.**

## Current Structure

### Components (`packages/web/src/components/`)
- Common components (ClientLayout, DashboardLayout, Loading, etc.)
- Job components (AddJobDialog, JobDetails, etc.)
- Property components (AddPropertyDialog, PropertyDetails, etc.)
- Settings components (JobTypeManagement)
- Technician components (EquipmentMarker, TechnicianMap, etc.)

### Services (`packages/web/src/services/`)
- `api.ts` - Main API service
- `auth.ts` - Authentication service
- `mockData.ts` - Mock data
- New domain-based API structure in `api/` directory

### Stores (`packages/web/src/stores/`)
- `accountStore.tsx` - Account management
- `equipmentStore.ts` - Equipment state
- `fieldMap3dStore.ts` - 3D map state
- `fieldMapStore.ts` - Field map state
- `jobStore.tsx` - Job management
- `mapStore.ts` - Map state

## New Structure

### Feature-Based Organization
```
(pages)/
├── accounts/
│   ├── components/
│   ├── dialogs/
│   └── stores/
├── jobs/
│   ├── components/
│   ├── dialogs/
│   └── stores/
├── properties/
│   ├── components/
│   ├── dialogs/
│   └── stores/
└── components/
    └── common/
```

### Shared Code
```
app/
└── layouts/
    ├── ClientLayout.tsx
    └── DashboardLayout.tsx

services/
└── api/
    ├── client.ts
    ├── index.ts
    └── domains/
```

## Migration Steps

1. Create new feature directories if they don't exist
2. Move components to their new locations
3. Update imports to use new paths
4. Test each feature thoroughly
5. Only after verifying everything works:
   - Remove old files
   - Remove empty directories

## Testing Requirements

Before any cleanup:
1. All features must work in new structure
2. No console errors
3. All API calls working
4. All state management working
5. Mobile responsiveness verified
6. End-to-end testing of major features

## Verification Checklist

For each feature:
- [ ] Components moved to new location
- [ ] Imports updated
- [ ] Feature tested thoroughly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] API calls working
- [ ] State management working

## Features to Test

1. Accounts
   - Account creation
   - Account editing
   - Account deletion
   - Address management

2. Properties
   - Property creation
   - Property editing
   - Map functionality
   - Address management

3. Jobs
   - Job creation
   - Job editing
   - Job scheduling
   - Job status updates

4. Equipment
   - Equipment placement
   - Equipment editing
   - Equipment status updates

5. Maps
   - 2D map functionality
   - 3D map functionality
   - Location selection
   - Boundary drawing

## Safety Measures

1. Keep old files until new structure is verified
2. Create git branch for migration
3. Document any breaking changes
4. Maintain rollback capability
5. Test thoroughly before cleanup

## Final Steps

Only after all features are verified working:
1. Remove old files
2. Remove empty directories
3. Update documentation
4. Final round of testing

Remember: This is a migration, not a deletion. Old files stay until new structure is proven working.
