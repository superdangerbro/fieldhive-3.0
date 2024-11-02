# TypeORM "No metadata for Setting was found" Error Fix

## The Problem
The error "No metadata for Setting was found" occurs when TypeORM can't properly initialize entity metadata at runtime. This typically happens when:
1. Entity decorators aren't processed correctly
2. The entity isn't properly registered with TypeORM
3. The database connection isn't initialized before use

## How We Fixed It

1. **Proper Entity Registration**
   ```typescript
   // config/database.ts
   export const AppDataSource = new DataSource({
       // ...
       entities: [Setting], // Explicitly register the Setting entity
   });
   ```

2. **Dedicated Repository Access**
   ```typescript
   // Instead of global repository
   const settingRepository = AppDataSource.getRepository(Setting);

   // Use in handlers
   export async function getEquipmentStatuses(req: Request, res: Response) {
       const settingRepository = AppDataSource.getRepository(Setting);
       const setting = await settingRepository.findOne({
           where: { key: EQUIPMENT_STATUSES_KEY }
       });
       // ...
   }
   ```

3. **Server Initialization**
   ```typescript
   // index.ts
   async function startServer() {
       try {
           // Initialize database before starting server
           await AppDataSource.initialize();
           console.log('Database connected successfully');

           // Then start HTTP server
           app.listen(API_PORT, () => {
               console.log(`API server is running on port ${API_PORT}`);
           });
       } catch (error) {
           console.error('Error starting server:', error);
           process.exit(1);
       }
   }
   ```

4. **Clean Server Restarts**
   ```powershell
   # reset-env.ps1
   # Kill all processes and start fresh
   Kill-ProcessOnPort 3001  # API server
   Kill-ProcessOnPort 3000  # Web server
   ```

The key was ensuring that:
1. The database connection is properly initialized before any repository access
2. The Setting entity is explicitly registered with TypeORM
3. We get a fresh repository instance for each request
4. We properly restart the server when making entity changes
