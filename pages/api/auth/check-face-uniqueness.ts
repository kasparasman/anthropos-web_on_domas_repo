import { NextApiRequest, NextApiResponse } from 'next';
import {
  RekognitionClient,
  SearchFacesByImageCommand,
  CreateCollectionCommand,
  Image as RekognitionImage, // Renaming to avoid conflict with Next/Image
} from '@aws-sdk/client-rekognition';
import sharp from 'sharp';

const rek = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const COLLECTION_ID = 'face_recognition_collection';
const SIMILARITY = 98; // %

/**
 * Ensures the Rekognition collection exists. Creates it if it doesn't.
 */
async function ensureCollection() {
  try {
    await rek.send(new CreateCollectionCommand({ CollectionId: COLLECTION_ID }));
    console.log('[FaceCheck] Collection created successfully or already exists.');
  } catch (err: unknown) {
    // Ignore if the collection already exists, throw other errors
    if (err instanceof Error && err.name === 'ResourceAlreadyExistsException') {
      console.log('[FaceCheck] Collection already exists.');
    } else {
      console.error('[FaceCheck] Error ensuring collection:', err);
      throw err;
    }
  }
}

/**
 * Fetches an image from a URL and prepares it for AWS Rekognition.
 * This includes validation and conversion to a compatible format (JPEG).
 * @param url The public URL of the image to process.
 * @returns A promise resolving to an Image object for the Rekognition API.
 */
async function urlToImage(url: string): Promise<RekognitionImage> {
  console.log('[FaceCheck] Fetching image from URL:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected an image format.`);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 1024) { // 1KB minimum
      throw new Error(`Image too small: ${arrayBuffer.byteLength} bytes`);
    }

    console.log('[FaceCheck] Converting image to JPEG for Rekognition...');
    const convertedBuffer = await sharp(Buffer.from(arrayBuffer))
      .jpeg({ quality: 90 })
      .resize({
        width: 2048,
        height: 2048,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    if (convertedBuffer.byteLength > 5 * 1024 * 1024) {
      throw new Error(`Converted image is too large: ${convertedBuffer.byteLength / (1024 * 1024)}MB. Max 5MB.`);
    }

    console.log('[FaceCheck] Image successfully prepared. Size:', convertedBuffer.byteLength, 'bytes');
    return { Bytes: new Uint8Array(convertedBuffer.buffer) };
  } catch (error: unknown) {
    console.error('[FaceCheck] urlToImage failed:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during image processing.';
    throw new Error(message);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ---------------- MOCK MODE ----------------
  // When running locally or in tests, we may want to bypass the potentially slow/
  // paid AWS Rekognition calls. If the environment variable `MOCK_FACE_INDEXING`
  // is set to 'true', short-circuit the handler and pretend the face is unique.
  // This follows the same convention used in `faceIndexingService.ts`.
  if (process.env.MOCK_FACE_INDEXING === 'true') {
    console.log('[FaceCheck] --- MOCK MODE ENABLED: Skipping Rekognition call. ---');
    // Optional: simulate a small network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300));
    return res.status(200).json({ isDuplicate: false, message: 'MOCK: Face is unique.' });
  }

  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing required parameter: imageUrl' });
  }

  console.log('[FaceCheck] Received request to check face uniqueness for:', imageUrl);

  try {
    await ensureCollection();

    const image = await urlToImage(imageUrl);

    console.log('[FaceCheck] Searching for face matches...');
    const searchResult = await rek.send(
      new SearchFacesByImageCommand({
        CollectionId: COLLECTION_ID,
        Image: image,
        FaceMatchThreshold: SIMILARITY,
        MaxFaces: 1, // We only need to know if at least one match exists
      })
    );
    console.log('[FaceCheck] Rekognition search completed.');

    if (searchResult.FaceMatches && searchResult.FaceMatches.length > 0) {
      console.warn('[FaceCheck] Duplicate face found.', { match: searchResult.FaceMatches[0] });
      return res.status(409).json({ isDuplicate: true, message: 'This face is already registered.' });
    }

    console.log('[FaceCheck] No duplicates found. Face is unique.');
    return res.status(200).json({ isDuplicate: false, message: 'Face is unique.' });

  } catch (err: unknown) {
    console.error('[FaceCheck] An unexpected error occurred in the handler:', err);
    const message = err instanceof Error ? err.message : 'An internal server error occurred.';
    // Avoid sending detailed internal errors to the client
    if (message.includes('image processing')) {
      return res.status(400).json({ error: 'There was a problem processing the uploaded image.' });
    }
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
} 