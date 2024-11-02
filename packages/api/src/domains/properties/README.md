# Properties Domain

The Properties domain is responsible for managing property data within the FieldHive application. It includes the following components:

## Structure

```
properties/
├── entities/            # Database entities
│   └── Property.ts     # Property entity definition
├── routes/             # API routes
│   ├── index.ts        # Main routes file
│   └── handlers/       # Route handlers
│       ├── archiveProperty.ts
│       ├── createProperty.ts
│       ├── getProperty.ts
│       ├── updateProperty.ts
│       └── index.ts
├── services/           # Business logic
│   └── propertyService.ts
└── types.ts            # Type definitions
```

## Features

- **CRUD Operations**: Create, read, update, and archive properties.
- **Data Validation**: Ensures that property data is valid before processing.
- **Integration**: Works seamlessly with the rest of the FieldHive application.

## Usage

To use the Properties domain, import the necessary components in your application:

```typescript
import { propertyRoutes } from './domains/properties';
```

## License

MIT
