/* lib/promoteAvatar.ts ------------------------------------------ */
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from './r2'

export async function promoteAvatar(tmpUrl: string, uid: string) {
  // tmpUrl = "https://…/anthropos-assets/tmp/abc.png"
  const tmpKey = new URL(tmpUrl).pathname.slice(1)          // tmp/abc.png
  const finalKey = `avatars/${uid}.png`

  await r2.send(new CopyObjectCommand({
    Bucket: process.env.R2_BUCKET,
    CopySource: `${process.env.R2_BUCKET}/${tmpKey}`,
    Key: finalKey,
  }))

  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: tmpKey,
  }))

  return `${process.env.R2_PUBLIC_HOST}/${finalKey}`
}
