/** @server-only */
import { NextApiRequest, NextApiResponse } from 'next'
import { PutObjectCommand } from '@aws-sdk/client-s3'

import { r2, R2_BUCKET, r2ObjectUrl } from '@/lib/r2'

const isProd = process.env.NODE_ENV === 'production'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://anthroposcity.com')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { file, filename, contentType } = req.body

    if (!file || !filename || !contentType) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64')

    // Generate a unique key
    const key = `tmp/${Date.now()}-${filename}`

    console.log('📤 [upload-file] Uploading to:', {
      bucket: R2_BUCKET,
      key,
      contentType,
      environment: isProd ? 'production' : 'development'
    })

    // Upload to R2
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }))

    const publicUrl = r2ObjectUrl(key)

    console.log('✅ [upload-file] Upload successful:', {
      url: publicUrl,
      environment: isProd ? 'production' : 'development'
    })

    res.status(200).json({ url: publicUrl })
  } catch (error) {
    const err = error as Error
    console.error('❌ [upload-file] Upload error:', {
      message: err.message,
      stack: err.stack,
      environment: isProd ? 'production' : 'development'
    })
    res.status(500).json({ error: err.message })
  }
} 