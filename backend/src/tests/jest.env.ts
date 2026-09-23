/* Runs via jest `setupFiles`, BEFORE any application module is imported, so the
 * validated env in src/config/env.ts sees these values. Keep this file free of imports. */
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '4';
// Placeholder so env validation passes; the real URI comes from mongodb-memory-server.
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/feedants-test-placeholder';
process.env.CORS_ORIGIN = '*';
