import {
  RekognitionClient,
  SearchFacesByImageCommand,
  IndexFacesCommand,
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
  console.log('[Rekognition] Fetching image from URL:', url)
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    
    // Check content type
    const contentType = response.headers.get('content-type')
    console.log('[Rekognition] Image content type:', contentType)
    
    // Accept various image formats and convert them if needed
    const isImageType = contentType && contentType.startsWith('image/')
    if (!isImageType) {
      throw new Error(`Invalid content type: ${contentType}. Expected an image format.`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    console.log('[Rekognition] Image size:', arrayBuffer.byteLength, 'bytes')
    
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
    console.log('[Rekognition] Converting image to JPEG format for Rekognition...')
    
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
      
      console.log('[Rekognition] Image converted successfully. New size:', convertedBuffer.byteLength, 'bytes')
      
      // Final size check after conversion
      if (convertedBuffer.byteLength > 5 * 1024 * 1024) {
        throw new Error(`Converted image still too large: ${convertedBuffer.byteLength} bytes. Max 5MB for Rekognition.`)
      }
      
    } catch (sharpError: any) {
      console.error('[Rekognition] Sharp conversion failed:', sharpError)
      throw new Error(`Image conversion failed: ${sharpError.message}`)
    }
    
    console.log('[Rekognition] Image successfully prepared for Rekognition')
    
    return { Bytes: new Uint8Array(convertedBuffer) }
  } catch (error: any) {
    console.error('[Rekognition] urlToImage failed:', error)
    throw new Error(`Image processing failed: ${error.message}`)
  }
}

function sanitize(id: string) {
  return id.replace(/[^a-zA-Z0-9_.\-:]/g, '_')
}

/**
 * Index a face directly (without duplicate checking)
 * Use this when you've already verified the face is unique
 */
export async function indexFaceOnly(
  imageUrl: string,
  externalId: string,
): Promise<string> {
  console.log('[Rekognition] Indexing face (no duplicate check)');
  console.log('[Rekognition] imageUrl:', imageUrl);
  console.log('[Rekognition] externalId:', externalId);

  await ensureCollection();
  console.log('[Rekognition] Collection ensured');

  let image;
  try {
    image = await urlToImage(imageUrl);
    console.log('[Rekognition] Image fetched and converted');
  } catch (err) {
    console.error('[Rekognition] Failed to fetch/convert image:', err);
    throw err;
  }

  // Index the face directly (no duplicate search)
  let index;
  try {
    index = await rek.send(
      new IndexFacesCommand({
        CollectionId: COLLECTION_ID,
        Image: image,
        DetectionAttributes: [],
        ExternalImageId: sanitize(externalId),
      })
    );
    console.log('[Rekognition] IndexFacesCommand result:', index);
  } catch (err) {
    console.error('[Rekognition] IndexFacesCommand failed:', err);
    throw err;
  }

  const faceId = index.FaceRecords?.[0]?.Face?.FaceId;
  if (!faceId) {
    console.error('[Rekognition] No FaceId returned');
    throw new Error('FACE_INDEX_FAILED');
  }
  console.log('[Rekognition] Face indexed successfully, FaceId:', faceId);
  return faceId;
}

/**
 * Original function that checks for duplicates AND indexes
 * Keep this for backward compatibility or non-optimized flows
 */
export async function indexOrRejectFace(
  imageUrl: string,
  externalId: string,
): Promise<string> {
  console.log('[Rekognition] Starting indexOrRejectFace');
  console.log('[Rekognition] imageUrl:', imageUrl);
  console.log('[Rekognition] externalId:', externalId);

  await ensureCollection()
  console.log('[Rekognition] Collection ensured');

  let image;
  try {
    image = await urlToImage(imageUrl)
    console.log('[Rekognition] Image fetched and converted');
  } catch (err) {
    console.error('[Rekognition] Failed to fetch/convert image:', err);
    throw err;
  }

  /* 1️⃣ Search for duplicates */
  let search;
  try {
    search = await rek.send(
      new SearchFacesByImageCommand({
        CollectionId: COLLECTION_ID,
        Image: image,
        FaceMatchThreshold: SIMILARITY,
        MaxFaces: 5,
      })
    )
    console.log('[Rekognition] SearchFacesByImageCommand result:', search);
  } catch (err) {
    console.error('[Rekognition] SearchFacesByImageCommand failed:', err);
    throw err;
  }

  if (search.FaceMatches?.length) {
    console.warn('[Rekognition] Duplicate face found');
    throw new Error('FACE_DUPLICATE');
  }

  /* 2️⃣ Index new face */
  let index;
  try {
    index = await rek.send(
      new IndexFacesCommand({
        CollectionId: COLLECTION_ID,
        Image: image,
        DetectionAttributes: [],
        ExternalImageId: sanitize(externalId),
      })
    )
    console.log('[Rekognition] IndexFacesCommand result:', index);
  } catch (err) {
    console.error('[Rekognition] IndexFacesCommand failed:', err);
    throw err;
  }

  const faceId = index.FaceRecords?.[0]?.Face?.FaceId
  if (!faceId) {
    console.error('[Rekognition] No FaceId returned');
    throw new Error('FACE_INDEX_FAILED');
  }
  console.log('[Rekognition] Face indexed successfully, FaceId:', faceId);
  return faceId
}
  