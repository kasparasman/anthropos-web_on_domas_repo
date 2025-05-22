import { r2 } from './r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

export async function uploadFromUrlToTmp(remoteUrl: string, ext: string) {
  const buf = await fetch(remoteUrl).then(r => r.arrayBuffer())
  const key = `tmp/${crypto.randomUUID()}.${ext}`
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: Buffer.from(buf),
    ContentType: `image/${ext}`,
  }))
  return `${process.env.R2_PUBLIC_HOST}/${key}`
}
