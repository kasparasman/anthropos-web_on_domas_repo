/** @server-only */
import { PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

import { r2, R2_BUCKET, r2ObjectUrl } from './r2'

export async function uploadFromUrlToTmp(url: string, contentType: string): Promise<string> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()

  const ext = url.split('.').pop() ?? 'png'
  const key = `tmp/${crypto.randomUUID()}.${ext}`

  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: contentType,
  }))

  return r2ObjectUrl(key)
}
