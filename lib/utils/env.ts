/**
 * Environment variable loader with runtime validation.
 */

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || defaultValue!
}

export const env = {
  // Database
  databaseUrl: getEnv('DATABASE_URL'),

  // Authentication
  authSecret: getEnv('AUTH_SECRET'),
  nextAuthUrl: getEnv('NEXTAUTH_URL'),
  nextAuthUrlInternal: getEnv('NEXTAUTH_URL_INTERNAL'),

  // File upload
  uploadDir: getEnv('UPLOAD_DIR', './public/uploads'),
  maxFileSizeMb: parseInt(getEnv('MAX_FILE_SIZE_MB', '10')),

  // Environment
  nodeEnv: getEnv('NODE_ENV', 'development'),
  isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
  isProduction: getEnv('NODE_ENV', 'development') === 'production',
}
