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

// Type-safe environment validation
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
] as const;

// Validate environment variables in development
if (process.env.NODE_ENV === 'development') {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Missing required environment variable: ${envVar}`);
    }
  }
}
