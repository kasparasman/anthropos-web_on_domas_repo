import { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📤 [upload-url] Received request:', { 
    method: req.method,
    body: req.body 
  })

  try {
    if (req.method !== 'POST') return res.status(405).end()

    if (!process.env.R2_BUCKET || !process.env.R2_PUBLIC_HOST) {
      console.error('❌ [upload-url] Missing env vars:', { 
        hasBucket: !!process.env.R2_BUCKET,
        hasHost: !!process.env.R2_PUBLIC_HOST
      })
      throw new Error('Missing required environment variables')
    }

    const { filename, contentType } = req.body as {
      filename: string
      contentType: string
    }

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Missing filename or contentType' })
    }

    // ---- generate tmp/<uuid>.<ext> --------------------------------
    const ext = filename.split('.').pop() ?? 'png'
    const key = `tmp/${crypto.randomUUID()}.${ext}`

    const putCmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3, putCmd, { expiresIn: 15 * 60 }) // 15 min
    const publicUrl = `${process.env.R2_PUBLIC_HOST}/${key}`

    console.log('📝 [upload-url] Generated key:', { key, ext })

    console.log('✅ [upload-url] Generated URLs:', { 
      uploadUrl: uploadUrl.substring(0, 50) + '...', // truncate for logging
      publicUrl 
    })

    res.status(200).json({ uploadUrl, publicUrl })
  } catch (error: any) {
    console.error('❌ [upload-url] Error:', error)
    res.status(500).json({ 
      error: 'Failed to generate upload URL', 
      details: error.message || 'Unknown error' 
    })
  }
}
