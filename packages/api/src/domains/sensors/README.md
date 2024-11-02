# Sensors Domain

The Sensors domain is responsible for managing sensor data within the FieldHive application. It includes the following components:

## Structure

```
sensors/
├── entities/            # Database entities
│   └── Sensor.ts       # Sensor entity definition
├── routes/             # API routes
│   ├── index.ts        # Main routes file
│   └── handlers/       # Route handlers
│       ├── getSensor.ts
│       ├── createSensor.ts
│       ├── updateSensor.ts
│       └── archiveSensor.ts
├── services/           # Business logic
│   └── sensorService.ts
└── types.ts            # Type definitions
```

## Features

- **CRUD Operations**: Create, read, update, and archive sensors.
- **Data Validation**: Ensures that sensor data is valid before processing.
- **Integration**: Works seamlessly with the rest of the FieldHive application.

## Usage

To use the Sensors domain, import the necessary components in your application:

```typescript
import { sensorRoutes } from './domains/sensors';
```

## License

MIT
