# FieldHive 3.0

A modern field service management platform built with Next.js, TypeScript, and PostgreSQL.

## Features

- 🗺️ Interactive property management with Mapbox integration
  - Draw and edit property boundaries
  - Geocoding for property addresses
  - Satellite view for accurate boundary drawing
- 👥 Account management
  - Create and manage customer accounts
  - Link properties to accounts
  - Role-based property access
- 📱 Responsive dashboard
  - Modern Material UI design
  - Real-time data updates
  - Intuitive navigation
- ⚙️ Configurable settings
  - Customizable statuses and types for all domains
  - Color-coded status management
  - Field definitions for types

## Tech Stack

### Frontend
- Next.js 13 with App Router
- TypeScript
- Material UI
- Mapbox GL JS
- React Map GL
- Zustand for state management

### Backend
- Node.js
- Express
- PostgreSQL with PostGIS
- TypeORM

### Infrastructure
- AWS RDS for PostgreSQL
- AWS S3 for file storage
- Mapbox for geocoding and maps

## Development

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL 16+ with PostGIS extension

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fieldhive-3.0.git
cd fieldhive-3.0
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Copy example env files
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env.local

# Update with your values
# Required variables:
# - Database connection details
# - Mapbox API token
# - AWS credentials
```

4. Start development servers:
```bash
# Start API server
cd packages/api
pnpm dev

# Start web server (in another terminal)
cd packages/web
pnpm dev
```

## Project Structure

```
fieldhive-3.0/
├── packages/
│   ├── api/                    # Backend API server
│   │   ├── src/
│   │   │   ├── config/        # Configuration
│   │   │   ├── domains/       # Domain-driven structure
│   │   │   │   ├── accounts/  # Account management
│   │   │   │   ├── equipment/ # Equipment management
│   │   │   │   ├── jobs/      # Job management
│   │   │   │   ├── properties/# Property management
│   │   │   │   └── settings/  # Settings management
│   │   │   ├── utils/         # Shared utilities
│   │   │   └── websocket/     # WebSocket functionality
│   │   └── package.json
│   └── web/                   # Frontend Next.js app
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/    # Authentication pages
│       │   │   ├── (pages)/   # Domain pages
│       │   │   │   ├── accounts/
│       │   │   │   ├── equipment/
│       │   │   │   ├── jobs/
│       │   │   │   ├── properties/
│       │   │   │   └── settings/
│       │   │   ├── globalComponents/
│       │   │   └── layouts/   # Shared layouts
│       │   ├── services/      # Core services
│       │   └── theme/         # MUI theme config
│       └── package.json
└── package.json
```

## Architecture

### Domain-Driven Design
- Each domain (accounts, equipment, jobs, properties) has its own:
  - API handlers and routes
  - React components and pages
  - Zustand stores for state management
  - Type definitions

### State Management
- Zustand stores with direct fetch calls
- Domain-specific stores co-located with components
- Proper loading and error states
- Automatic re-fetch on failed updates

### Type Safety
- Centralized types in globaltypes.ts
- Domain-specific types in domain folders
- Consistent interface patterns
- Full TypeScript coverage

## Documentation

- [Initial Setup](docs/ai-chats/initial-setup.md)
- [Schema Management](docs/ai-chats/schema-management.md)
- [Property Creation Flow](docs/ai-chats/property-creation-flow.md)
- [Settings Page Improvements](docs/settings-page-improvements.md)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT
