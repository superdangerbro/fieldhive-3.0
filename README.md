# Field Hive 3.0

A modern field service management system built with TypeScript, Node.js, and React.

## Project Structure

This is a monorepo using pnpm workspaces with the following packages:

- `packages/api`: Backend API server using Express and TypeORM
- `packages/web`: Frontend web application using Next.js
- `packages/shared`: Shared types and utilities

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
# API environment variables
cp packages/api/.env.example packages/api/.env
# Update the .env file with your database credentials

# Web environment variables
cp packages/web/.env.example packages/web/.env.local
# Add your Mapbox token to NEXT_PUBLIC_MAPBOX_TOKEN
```

3. Configure Mapbox:
- Create a Mapbox account at https://www.mapbox.com/
- Create a new token with the following scopes:
  - styles:read
  - styles:tiles
  - fonts:read
  - styles:write
- Add the token to `packages/web/.env.local`

4. Start the development servers:
```bash
pnpm dev
```

## Documentation

- [Initial Setup](docs/ai-chats/initial-setup.md): Account management system setup and API documentation
- [Schema Management](docs/ai-chats/schema-management.md): Database schema and migration management

## Features

### Account Management
- Create accounts with minimal required information
- Optional billing address and property management
- Progressive account setup workflow
- Full CRUD operations with proper transaction handling
- Server-side pagination with Material UI DataGrid
- Efficient database queries with proper JOIN operations

### Technician Tracking System
- Real-time technician location tracking using Mapbox GL JS
- High-accuracy GPS tracking with heading support
- User location persistence using Zustand state management
- Map controls for style switching and tracking toggle
- Equipment inspection workflow with dialog-based interface
- Responsive map layout with absolute positioning

## Architecture

### State Management
- Zustand stores for global state management
- Separate stores for equipment and map state
- Clean separation of concerns between stores
- Reactive state updates with proper cleanup

### Map Implementation
- Dynamic map loading to avoid SSR issues
- GeolocateControl for native device location access
- Custom markers for user location and equipment
- Efficient re-renders using React.memo and useCallback
- Map style cycling with persistent state

### Data Flow
1. User location tracking:
   - GeolocateControl triggers device location
   - Position updates stored in mapStore
   - UserLocationMarker renders based on store state
   - Tracking state persists across component lifecycle

2. Equipment management:
   - Equipment data stored in equipmentStore
   - Markers render based on equipment state
   - Inspection dialog manages its own local state
   - Updates flow through store actions

## Development

### API Development
The API server uses:
- Express for routing
- TypeORM for database management
- PostgreSQL with PostGIS for spatial data
- Zod for runtime type validation

### Web Development
The web application uses:
- Next.js for server-side rendering
- Tailwind CSS for styling
- TypeScript for type safety
- Material UI components
- Mapbox GL JS for mapping
- Zustand for state management

### Shared Package
Contains:
- TypeScript interfaces
- Shared utilities
- Type definitions for API requests/responses
- Common types for geospatial data

## Component Architecture

### Technician Page
- Dynamic import of map component
- Loading state with CircularProgress
- Proper cleanup of map resources
- Event handling for map interactions

### Map Components
- TechnicianMap: Main container with map setup
- UserLocationMarker: Shows current position
- EquipmentMarker: Displays equipment locations
- MapControls: UI for map interactions
- EquipmentInspectionDialog: Equipment management

### Data Grid Components
- Server-side pagination implementation
- Proper typing with GridColDef
- Custom cell rendering with Chip components
- Efficient data fetching with proper error handling

## Environment Variables

### API (.env)
```
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
PORT=3001
NODE_ENV=development
JWT_SECRET=your-jwt-secret
LOG_LEVEL=info
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_DEFAULT_LATITUDE=37.7749
NEXT_PUBLIC_DEFAULT_LONGITUDE=-122.4194
NEXT_PUBLIC_DEFAULT_ZOOM=12
```

## Browser Requirements
- Geolocation API support
- WebGL support for Mapbox
- Modern browser with ES6+ features
- Secure context (HTTPS) for production deployment

## Mobile Support
- Responsive design for all screen sizes
- Touch-friendly controls
- High-accuracy GPS support on mobile devices
- Proper handling of device orientation

## Troubleshooting

### Location Tracking Issues
1. Check browser permissions for location access
2. Ensure device has GPS enabled
3. Verify HTTPS in production environment
4. Check Mapbox token scopes

### Map Loading Issues
1. Verify Mapbox token is correctly set
2. Check browser WebGL support
3. Clear browser cache if styles don't update
4. Check browser console for specific errors

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database credentials
3. Ensure PostGIS extension is enabled
4. Verify network access to database host

### Development Server Issues
1. Check if ports 3000 and 3001 are available
2. Verify all dependencies are installed
3. Clear node_modules and reinstall if needed
4. Check for TypeScript compilation errors
