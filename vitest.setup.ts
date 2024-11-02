import { loadEnvConfig } from '@next/env';

loadEnvConfig(__dirname, true); // true forces reload

// Add any other test setup needed
beforeAll(() => {
  // Verify required env vars are present
  const requiredEnvVars = ['KV_REST_API_URL', 'KV_REST_API_TOKEN'];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });
});
