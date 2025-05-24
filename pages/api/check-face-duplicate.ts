import { NextApiRequest, NextApiResponse } from 'next'
import {
  RekognitionClient,
  SearchFacesByImageCommand,
  CreateCollectionCommand,
  Image,
} from '@aws-sdk/client-rekognition'

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
  return {
    Bytes: new Uint8Array(await (await fetch(url)).arrayBuffer())
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