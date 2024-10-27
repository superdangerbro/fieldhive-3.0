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

## Tech Stack

### Frontend
- Next.js 13 with App Router
- TypeScript
- Material UI
- Mapbox GL JS
- React Map GL

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
│   ├── api/               # Backend API server
│   │   ├── src/
│   │   │   ├── config/   # Configuration
│   │   │   ├── entities/ # Database entities
│   │   │   ├── routes/   # API routes
│   │   │   └── services/ # Business logic
│   │   └── package.json
│   ├── shared/           # Shared types and utilities
│   │   └── src/
│   │       └── types/    # TypeScript types
│   └── web/              # Frontend Next.js app
│       ├── src/
│       │   ├── app/      # Next.js pages
│       │   ├── components/
│       │   └── services/ # API clients
│       └── package.json
└── package.json
```

## Documentation

- [Initial Setup](docs/ai-chats/initial-setup.md)
- [Schema Management](docs/ai-chats/schema-management.md)
- [Property Creation Flow](docs/ai-chats/property-creation-flow.md)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT
