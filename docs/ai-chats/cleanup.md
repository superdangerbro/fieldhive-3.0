# Cleanup Instructions for FieldHive 3.0

## Project Structure Overview

The project is organized into several domains, each containing its own entities, services, types, and routes. Below is a brief overview of the current structure:

```
fieldhive-3.0/
├── packages/
│   ├── api/               # Backend API server
│   │   ├── src/
│   │   │   ├── domains/   # Domain-specific logic
│   │   │   ├── config/    # Configuration
│   │   │   └── shared/    # Shared types and utilities
│   └── web/               # Frontend Next.js app
└── README.md              # Project documentation
```

## Folders to Archive

- **Old Features**: 
  - Any folders related to features that are no longer in use or have been replaced by new implementations.
  
- **Backup Folders**: 
  - Any backup folders that contain old versions of files or databases that are no longer needed for active development.

## Cleanup Instructions

1. **Identify Folders**: Review the project structure and identify folders that can be archived.
2. **Move to Archive**: Move identified folders to a temporary archive folder.
3. **Document Changes**: Update this README with any changes made during the cleanup process.

## Notes

- Ensure that any important data is backed up before archiving.
- Communicate with the team about any changes to the project structure.

## License

MIT
