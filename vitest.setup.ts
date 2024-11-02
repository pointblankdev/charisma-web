import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

// Add any needed globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
