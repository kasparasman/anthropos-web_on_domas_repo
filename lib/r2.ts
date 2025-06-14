/** @server-only */
import { S3Client } from '@aws-sdk/client-s3'

// ---------------------------------------------------------------------------
// R2 singleton & helpers
// This module centralises all interaction with Cloudflare R2.  Import `r2` to
// perform S3-compatible operations and use the exported helpers for bucket &
// URL resolution so we don't repeat environment-switch logic across the code
// base. Keeping it in one place also makes it easier to unit-test and refactor
// later (e.g. if we swap storage providers).
// ---------------------------------------------------------------------------

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Unified environment variables (set individually per environment file)
export const R2_BUCKET = process.env.R2_BUCKET

export const R2_PUBLIC_HOST = process.env.R2_PUBLIC_HOST

// ---------------------------------------------------------------------------
// Private bucket (no public read access)
// ---------------------------------------------------------------------------

export const R2_BUCKET_PRIVATE = process.env.R2_BUCKET_PRIVATE

function assertEnv(name: string, value: unknown): asserts value {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
}

// Validate that all required variables are present at module load time so we
// fail fast during application startup rather than at the first I/O request.
assertEnv('R2_ENDPOINT_URL', process.env.R2_ENDPOINT_URL)
assertEnv('R2_ACCESS_KEY_ID', process.env.R2_ACCESS_KEY_ID)
assertEnv('R2_SECRET_ACCESS_KEY', process.env.R2_SECRET_ACCESS_KEY)
assertEnv('R2_BUCKET', R2_BUCKET)
assertEnv('R2_BUCKET_PRIVATE', R2_BUCKET_PRIVATE)
assertEnv('R2_PUBLIC_HOST', R2_PUBLIC_HOST)

export const r2 = new S3Client({
  region: 'auto',                  // R2 requires the pseudo-region "auto"
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

/**
 * Derive the public URL for a given object key using the environment-specific
 * public host.  Throws if the host isn't configured.
 */
export function r2ObjectUrl(key: string): string {
  assertEnv('R2_PUBLIC_HOST', R2_PUBLIC_HOST)
  return `https://${R2_PUBLIC_HOST}/${key}`
}

// ---------------------------------------------------------------------------
// Optional debug utility
// ---------------------------------------------------------------------------

/** Log helper that only prints when DEBUG_R2=true (to keep prod logs clean). */
export function debugR2(message: string, payload?: unknown): void {
  if (process.env.DEBUG_R2 === 'true') {
    // eslint-disable-next-line no-console
    console.log(`[R2] ${message}`, payload ?? '')
  }
}
