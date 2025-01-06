// Central environment configuration for AWS deployment

export const ENV_CONFIG = {
  // API Configuration
  api: {
    // In development: http://localhost:3001/api
    // In production: Will be same EC2 instance, different port
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    
    // Timeouts and retries
    timeout: 30000,
    maxRetries: 3,
  },

  // React Query Configuration
  queryClient: {
    // Keep minimal for small user base
    defaultStaleTime: 30000,    // 30 seconds
    defaultCacheTime: 300000,   // 5 minutes
    maxRetries: 1,
  },

  // AWS Specific (for later IoT integration)
  aws: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    // IoT endpoint will be added later
    iotEndpoint: process.env.NEXT_PUBLIC_AWS_IOT_ENDPOINT,
  }
} as const;

// Export API URL for direct use
export const API_URL = ENV_CONFIG.api.baseUrl;

// Type-safe environment validation
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
] as const;

export function validateEnvironment() {
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.warn(
      'Missing required environment variables:\n' +
      missingVars.map(v => `  - ${v}`).join('\n') +
      '\nSome features may not work correctly.'
    );
    return false;
  }

  return true;
}

// Helper function to ensure API URL is available
export function getApiUrl() {
  return ENV_CONFIG.api.baseUrl;
}

// Helper to check if environment is properly configured
export function isEnvironmentConfigured() {
  return validateEnvironment();
}
