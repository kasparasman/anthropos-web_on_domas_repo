// lib/dbUrl.ts
// Centralised logic for picking the Postgres connection string.
// Each environment file (.env.development.local, .env.production.local, etc.) 
// should define a single variable: DATABASE_URL

export const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  // Fail fast to avoid Prisma trying to connect to undefined.
  throw new Error('[dbUrl] Missing environment variable: DATABASE_URL')
} 