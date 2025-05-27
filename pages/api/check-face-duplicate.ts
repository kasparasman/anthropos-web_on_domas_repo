import { NextApiRequest, NextApiResponse } from 'next'
import {
  RekognitionClient,
  SearchFacesByImageCommand,
  CreateCollectionCommand,
  Image,
} from '@aws-sdk/client-rekognition'
import sharp from 'sharp'

const rek = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const COLLECTION_ID = 'face_recognition_collection'
const SIMILARITY = 98 // %

async function ensureCollection() {
  try {
    await rek.send(new CreateCollectionCommand({ CollectionId: COLLECTION_ID }))
  } catch (err: any) {
    if (err.name !== 'ResourceAlreadyExistsException') throw err
  }
}

async function urlToImage(url: string): Promise<Image> {
  console.log('[FaceCheck] Fetching image from URL:', url)
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    
    // Check content type
    const contentType = response.headers.get('content-type')
    console.log('[FaceCheck] Image content type:', contentType)
    
    // Accept various image formats and convert them if needed
    const isImageType = contentType && contentType.startsWith('image/')
    if (!isImageType) {
      throw new Error(`Invalid content type: ${contentType}. Expected an image format.`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    console.log('[FaceCheck] Image size:', arrayBuffer.byteLength, 'bytes')
    
    // Check minimum size (empty or too small images)
    if (arrayBuffer.byteLength < 100) {
      throw new Error(`Image too small: ${arrayBuffer.byteLength} bytes`)
    }
    
    // Check maximum size (15MB limit before conversion, Rekognition allows 5MB)
    if (arrayBuffer.byteLength > 15 * 1024 * 1024) {
      throw new Error(`Image too large: ${arrayBuffer.byteLength} bytes. Max 15MB allowed.`)
    }
    
    const inputBuffer = Buffer.from(arrayBuffer)
    
    // Convert image to JPEG format for Rekognition compatibility
    console.log('[FaceCheck] Converting image to JPEG format for Rekognition...')
    
    let convertedBuffer: Buffer
    try {
      convertedBuffer = await sharp(inputBuffer)
        .jpeg({ 
          quality: 90,           // High quality to preserve face details
          progressive: false,    // Non-progressive for faster processing
          mozjpeg: true         // Use mozjpeg for better compression
        })
        .resize({
          width: 2048,          // Limit max dimensions for Rekognition
          height: 2048,
          fit: 'inside',        // Maintain aspect ratio
          withoutEnlargement: true  // Don't upscale small images
        })
        .toBuffer()
      
      console.log('[FaceCheck] Image converted successfully. New size:', convertedBuffer.byteLength, 'bytes')
      
      // Final size check after conversion
      if (convertedBuffer.byteLength > 5 * 1024 * 1024) {
        throw new Error(`Converted image still too large: ${convertedBuffer.byteLength} bytes. Max 5MB for Rekognition.`)
      }
      
    } catch (sharpError: any) {
      console.error('[FaceCheck] Sharp conversion failed:', sharpError)
      throw new Error(`Image conversion failed: ${sharpError.message}`)
    }
    
    console.log('[FaceCheck] Image successfully prepared for Rekognition')
    
    return { Bytes: new Uint8Array(convertedBuffer) }
  } catch (error: any) {
    console.error('[FaceCheck] urlToImage failed:', error)
    throw new Error(`Image processing failed: ${error.message}`)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageUrl, email } = req.body

  if (!imageUrl || !email) {
    return res.status(400).json({ error: 'Missing imageUrl or email' })
  }

  console.log('[FaceCheck] Checking for duplicates:', { imageUrl, email })

  try {
    await ensureCollection()
    console.log('[FaceCheck] Collection ensured')

    // Convert image URL to bytes
    let image
    try {
      image = await urlToImage(imageUrl)
      console.log('[FaceCheck] Image fetched and converted')
    } catch (err) {
      console.error('[FaceCheck] Failed to fetch/convert image:', err)
      return res.status(400).json({ error: 'Failed to fetch image' })
    }

    // Search for duplicates (but don't index)
    let search
    try {
      search = await rek.send(
        new SearchFacesByImageCommand({
          CollectionId: COLLECTION_ID,
          Image: image,
          FaceMatchThreshold: SIMILARITY,
          MaxFaces: 5,
        })
      )
      console.log('[FaceCheck] SearchFacesByImageCommand result:', search)
    } catch (err) {
      console.error('[FaceCheck] SearchFacesByImageCommand failed:', err)
      return res.status(500).json({ error: 'Face recognition service failed' })
    }

    // Check if duplicates found
    if (search.FaceMatches?.length) {
      console.warn('[FaceCheck] Duplicate face found')
      return res.status(409).json({ error: 'FACE_DUPLICATE' })
    }

    console.log('[FaceCheck] No duplicates found - face is unique')
    return res.status(200).json({ success: true, message: 'Face is unique' })

  } catch (err: any) {
    console.error('[FaceCheck] Unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 