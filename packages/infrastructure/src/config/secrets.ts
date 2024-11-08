import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { z } from 'zod';

const secretsSchema = z.object({
  database: z.object({
    host: z.string(),
    port: z.number(),
    name: z.string(),
    user: z.string(),
    password: z.string(),
  }),
  jwt: z.object({
    secret: z.string(),
  }),
  aws: z.object({
    region: z.string(),
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
  }),
});

export type Secrets = z.infer<typeof secretsSchema>;

export const getSecrets = async (environment: string): Promise<Secrets> => {
  const secretsManager = new SecretsManager({
    region: process.env.AWS_REGION,
  });

  const secretName = `field-hive/${environment}/secrets`;
  
  try {
    const response = await secretsManager.getSecretValue({ SecretId: secretName });
    const secrets = JSON.parse(response.SecretString || '{}');
    return secretsSchema.parse(secrets);
  } catch (error) {
    console.error('Failed to fetch secrets:', error);
    throw error;
  }
};