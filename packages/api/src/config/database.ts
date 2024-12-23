import { z } from 'zod';
import { DataSource } from 'typeorm';
import { getSecrets } from '@fieldhive/infrastructure';

// Database config schema
const dbConfigSchema = z.object({
  host: z.string(),
  port: z.coerce.number().default(5432), // Use coerce for better number parsing
  username: z.string(),
  password: z.string(),
  database: z.string(),
  ssl: z.boolean().default(true),
  sslRejectUnauthorized: z.boolean().default(false),
});

// Environment schema
const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432), // Use coerce here too
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SSL: z.coerce.boolean().default(true),
  DB_SSL_REJECT_UNAUTHORIZED: z.coerce.boolean().default(false),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse environment variables
export const env = envSchema.parse({
  DB_HOST: process.env.DB_HOST || 'field-hive.cdgykw2u8hxy.us-east-1.rds.amazonaws.com',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_USER: process.env.DB_USER || 'superdangerbro',
  DB_PASSWORD: process.env.DB_PASSWORD || 'Tripod2001!',
  DB_NAME: process.env.DB_NAME || 'field_hive_development',
  DB_SSL: process.env.DB_SSL || true,
  DB_SSL_REJECT_UNAUTHORIZED: process.env.DB_SSL_REJECT_UNAUTHORIZED || false,
  NODE_ENV: process.env.NODE_ENV || 'development',
});

// Create TypeORM data source
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: ['src/domains/*/entities/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  ssl: env.DB_SSL ? {
    rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED
  } : false,
});

// Load secrets in production
export const loadSecrets = async () => {
  if (env.NODE_ENV === 'production') {
    const secrets = await getSecrets('production');
    return {
      host: secrets.database.host,
      port: secrets.database.port,
      username: secrets.database.user,
      password: secrets.database.password,
      database: secrets.database.name,
    };
  }
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  };
};
