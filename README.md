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
cp packages/api/.env.example packages/api/.env
# Update the .env file with your database credentials
```

3. Start the development servers:
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

### Shared Package
Contains:
- TypeScript interfaces
- Shared utilities
- Type definitions for API requests/responses
