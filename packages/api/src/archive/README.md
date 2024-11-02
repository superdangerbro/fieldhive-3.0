# Archived Files

This directory contains files from the old project structure that have been migrated to the new domain-based architecture. These files are kept for reference but should not be used in the new codebase.

## Directory Structure

```
archive/
├── entities/           # Old entity definitions
├── routes/            # Old route handlers and configurations
└── services/          # Old services
```

## Migrated Files

### Entities
- Account.ts -> domains/accounts/entities/
- Address.ts -> domains/addresses/entities/
- Equipment.ts -> domains/equipment/entities/
- Job.ts -> domains/jobs/entities/
- Property.ts -> domains/properties/entities/
- Setting.ts -> domains/settings/entities/
- PropertiesAccounts.ts -> domains/properties/entities/
- UsersAccounts.ts -> domains/accounts/entities/

### Routes
- accounts/ -> domains/accounts/routes/
- addresses/ -> domains/addresses/routes/
- dashboard/ -> domains/dashboard/routes/
- equipment_types/ -> domains/equipment/routes/
- field_equipment/ -> domains/equipment/routes/
- fields/ -> domains/fields/routes/
- health/ -> domains/health/routes/
- inspections/ -> domains/inspections/routes/
- job_types/ -> domains/jobs/routes/
- jobs/ -> domains/jobs/routes/
- properties/ -> domains/properties/routes/
- sensors/ -> domains/sensors/routes/
- settings/ -> domains/settings/routes/

### Services
- spatial.service.ts -> domains/properties/services/

## Note

These files are kept for historical reference and to assist with any necessary rollbacks or comparisons. They should not be imported or used in the new codebase. All new development should use the domain-based structure in the `domains/` directory.
