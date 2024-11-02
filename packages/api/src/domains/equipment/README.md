# Equipment Domain

The Equipment domain is responsible for managing equipment data within the FieldHive application. It includes the following components:

## Structure

```
equipment/
├── entities/            # Database entities
│   └── Equipment.ts    # Equipment entity definition
├── routes/             # API routes
│   ├── index.ts        # Main routes file
│   └── handlers/       # Route handlers
│       ├── archiveEquipment.ts
│       ├── createEquipment.ts
│       ├── getEquipment.ts
│       ├── updateEquipment.ts
│       └── index.ts
├── services/           # Business logic
│   └── equipmentService.ts
└── types.ts            # Type definitions
```

## Features

- **CRUD Operations**: Create, read, update, and archive equipment.
- **Data Validation**: Ensures that equipment data is valid before processing.
- **Integration**: Works seamlessly with the rest of the FieldHive application.

## Usage

To use the Equipment domain, import the necessary components in your application:

```typescript
import { equipmentRoutes } from './domains/equipment';
```

## License

MIT
