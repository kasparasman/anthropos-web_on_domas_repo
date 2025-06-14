/** @server-only */
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

import { r2, R2_BUCKET, r2ObjectUrl } from './r2'

/**
 * Move an uploaded avatar from its temporary location (tmp/<uuid>.*) to its
 * final key.  Returns the public URL of the promoted object.
 */
export async function promoteAvatar(tmpKey: string, finalKey: string): Promise<string> {
  // Copy from tmp to final location
  await r2.send(new CopyObjectCommand({
    Bucket: R2_BUCKET,
    CopySource: `${R2_BUCKET}/${tmpKey}`,
    Key: finalKey,
  }))

  // Delete the tmp file
  await r2.send(new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: tmpKey,
  }))

  return r2ObjectUrl(finalKey)
}
