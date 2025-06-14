/** @server-only */
import { NextApiRequest, NextApiResponse } from 'next'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

import { r2, R2_BUCKET, r2ObjectUrl } from '@/lib/r2'

const isProd = process.env.NODE_ENV === 'production'

// CORS headers with specific origins
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://anthroposcity.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-amz-acl, x-amz-meta-*',
  'Access-Control-Max-Age': '86400', // 24 hours
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders)
    res.end()
    return
  }

  // Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  console.log('📤 [upload-url] Received request:', {
    method: req.method,
    body: req.body,
    environment: isProd ? 'production' : 'development',
    endpoint: process.env.R2_ENDPOINT_URL,
    bucket: R2_BUCKET,
    host: process.env.R2_PUBLIC_HOST_PROD ?? process.env.R2_PUBLIC_HOST_DEV
  })

  try {
    if (req.method !== 'POST') return res.status(405).end()

    if (!R2_BUCKET) {
      console.error('❌ [upload-url] Missing R2_BUCKET env var')
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
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    console.log('📝 [upload-url] Generating signed URL:', {
      bucket: R2_BUCKET,
      key,
      contentType,
      environment: isProd ? 'production' : 'development'
    })

    const uploadUrl = await getSignedUrl(r2, putCmd, { expiresIn: 15 * 60 }) // 15 min
    const publicUrl = r2ObjectUrl(key)

    console.log('✅ [upload-url] Generated URLs:', { 
      uploadUrl: uploadUrl.substring(0, 50) + '...', // truncate for logging
      publicUrl,
      environment: isProd ? 'production' : 'development'
    })

    res.status(200).json({ uploadUrl, publicUrl })
  } catch (error: any) {
    console.error('❌ [upload-url] Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      environment: isProd ? 'production' : 'development'
    })
    res.status(500).json({ 
      error: 'Failed to generate upload URL', 
      details: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN_ERROR'
    })
  }
}
