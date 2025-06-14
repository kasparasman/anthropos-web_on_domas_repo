/** @server-only */
import type { NextApiRequest, NextApiResponse } from 'next'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

import { r2, R2_BUCKET, R2_BUCKET_PRIVATE, r2ObjectUrl, debugR2 } from '@/lib/r2'

interface Body {
  filename: string
  contentType: string
  /** Optional prefix e.g. 'tmp' | 'avatars' | 'userfaceimage'. Defaults to 'tmp'. */
  purpose?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { filename, contentType, purpose = 'tmp' } = req.body as Body
  debugR2('Incoming sign-upload request', { filename, contentType, purpose })

  if (!filename || !contentType) {
    return res.status(400).json({ error: 'Missing filename or contentType' })
  }

  // Basic MIME allow-list for images only; tighten later if needed.
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Unsupported content type' })
  }

  // Sanitize filename (strip path separators) & generate unique key
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${purpose}/${crypto.randomUUID()}-${safeName}`
  debugR2('Generated R2 object key', key)

  // Choose bucket: faces use the private bucket, others use the public bucket.
  const isFaceImage = purpose === 'userfaceimage'
  const bucket = isFaceImage ? R2_BUCKET_PRIVATE : R2_BUCKET

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,

  })

  try {
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60*60 })
    debugR2('Generated presigned URL', uploadUrl)

    let publicUrl: string | undefined
    if (isFaceImage) {
      // For private uploads we still need a temporary downloadable URL so the
      // server can fetch the object for face uniqueness checks.
      const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key })
      publicUrl = await getSignedUrl(r2, getCmd, { expiresIn: 60 * 10 }) // 10-min GET URL
    } else {
      publicUrl = r2ObjectUrl(key)
    }

    return res.status(200).json({ uploadUrl, key, publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sign-upload] Failed to sign URL:', message)
    return res.status(500).json({ error: 'Failed to generate presigned URL' })
  }
} 