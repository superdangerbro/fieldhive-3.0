# Migration and Cleanup Plan

[Previous content remains...]

## Files to Move

### Entities to Move
From `packages/api/src/entities/` to their respective domain folders:

1. Account.ts -> Already moved to domains/accounts/entities/
2. Address.ts -> Move to domains/addresses/entities/
3. Equipment.ts -> Move to domains/equipment/entities/
4. Job.ts -> Move to domains/jobs/entities/
5. Property.ts -> Move to domains/properties/entities/
6. Setting.ts -> Move to domains/settings/entities/ (create domain)
7. PropertiesAccounts.ts -> Move to domains/properties/entities/
8. UsersAccounts.ts -> Move to domains/accounts/entities/

### Routes to Move
From `packages/api/src/routes/` to their respective domain folders:

1. accounts/ -> Already moved
2. addresses/ -> Move to domains/addresses/routes/
3. dashboard/ -> Move to domains/dashboard/routes/
4. equipment_types/ -> Move to domains/equipment/routes/
5. field_equipment/ -> Move to domains/equipment/routes/
6. fields/ -> Move to domains/fields/routes/
7. health/ -> Move to domains/health/routes/ (create domain)
8. inspections/ -> Move to domains/inspections/routes/ (create domain)
9. job_types/ -> Move to domains/jobs/routes/
10. jobs/ -> Move to domains/jobs/routes/
11. properties/ -> Move to domains/properties/routes/
12. sensors/ -> Move to domains/sensors/routes/
13. settings/ -> Move to domains/settings/routes/

### Services to Move
From `packages/api/src/services/` to their respective domain folders:

1. spatial.service.ts -> Move to domains/properties/services/

## Folders to Archive
After verifying all files have been moved and the new structure is working:

1. `packages/api/src/entities/`
2. `packages/api/src/routes/`
3. `packages/api/src/services/`

## Migration Steps

1. Create any missing domain folders
2. Move entities to their respective domains
3. Move routes to their respective domains
4. Move services to their respective domains
5. Update imports in all moved files
6. Test thoroughly
7. Archive old folders

## Testing Requirements

[Previous content remains...]

## Safety Measures

[Previous content remains...]

## Final Steps

[Previous content remains...]
