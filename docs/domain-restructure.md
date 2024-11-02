# Domain-Based Restructuring Plan

## Domain Structure

### 1. Addresses Domain
Files:
- `entities/Address.ts`
- `routes/addresses/*`

Responsibilities:
- Address CRUD operations
- Address validation
- Geocoding services
- Address relationships
- Address formatting

Used by:
- Accounts (billing addresses)
- Properties (service addresses)
- Jobs (job site addresses)

### 2. Accounts Domain
Files:
- `entities/Account.ts`
- `entities/UsersAccounts.ts`
- `routes/accounts/*`

Responsibilities:
- Account management
- User-account relationships
- Account settings
- Account validation
- References addresses via foreign keys

### 3. Properties Domain
Files:
- `entities/Property.ts`
- `entities/PropertiesAccounts.ts`
- `services/spatial.service.ts`

Responsibilities:
- Property management
- Property-account relationships
- Location/spatial services
- Property boundaries
- Property metadata
- References addresses via foreign keys

### 4. Equipment Domain
Files:
- `routes/equipment_types/*`
- `routes/field_equipment/*`
- `entities/Equipment.ts`

Responsibilities:
- Equipment management
- Equipment types
- Equipment placement
- Equipment status
- Equipment inspections

### 5. Jobs Domain
Files:
- `routes/jobs/*`
- `routes/job_types/*`
- `entities/Job.ts`

Responsibilities:
- Job management
- Job types
- Job scheduling
- Job status
- Job assignments
- References addresses via foreign keys

### 6. Fields Domain
Files:
- `routes/fields/*`
- `routes/inspections/*`

Responsibilities:
- Field management
- Field boundaries
- Field inspections
- Field metadata

### 7. Sensors Domain
Files:
- `routes/sensors/*`

Responsibilities:
- Sensor management
- Sensor data
- Sensor types
- Sensor status

### 8. Dashboard Domain
Files:
- `routes/dashboard/*`

Responsibilities:
- Activity tracking
- Metrics
- Analytics
- Reports

## New Directory Structure

```
api/src/
├── domains/
│   ├── addresses/
│   │   ├── entities/
│   │   │   └── Address.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── handlers/
│   │   │   └── validation.ts
│   │   └── services/
│   │       ├── geocoding.service.ts
│   │       └── validation.service.ts
│   ├── accounts/
│   │   ├── entities/
│   │   │   ├── Account.ts
│   │   │   └── UsersAccounts.ts
│   │   ├── routes/
│   │   └── services/
│   ├── properties/
│   │   ├── entities/
│   │   │   ├── Property.ts
│   │   │   └── PropertiesAccounts.ts
│   │   ├── routes/
│   │   └── services/
│   │       └── spatial.service.ts
│   └── [other domains follow same pattern]
└── core/
    ├── config/
    │   ├── database.ts
    │   └── env.ts
    ├── middleware/
    │   └── errorHandler.ts
    └── utils/
        ├── logger.ts
        └── sql.ts
```

## Implementation Steps

1. Create Base Structure
   ```
   mkdir -p api/src/domains/{addresses,accounts,properties,equipment,jobs,fields,sensors,dashboard}
   mkdir -p api/src/core/{config,middleware,utils}
   ```

2. Move Address Domain First
   - Move Address entity
   - Move address routes
   - Create address services
   - Update imports in other domains

3. Move Other Domains (in order)
   - Accounts (depends on addresses)
   - Properties (depends on accounts, addresses)
   - Equipment
   - Jobs (depends on accounts, addresses)
   - Fields
   - Sensors
   - Dashboard

4. Move Core Infrastructure
   - Move config files
   - Move middleware
   - Move shared utils

5. Update References
   - Update import paths
   - Update foreign key references
   - Update API endpoints

6. Testing Strategy
   - Test address functionality first
   - Test each domain's integration with addresses
   - Test cross-domain functionality
   - Test API endpoints

## Notes

- Keep address logic centralized in addresses domain
- Other domains reference addresses via foreign keys
- Address validation and formatting handled by address domain
- Consider creating address-specific types
- Consider address-specific error handling
- Document cross-domain dependencies

Would you like to start with implementing the addresses domain first?
