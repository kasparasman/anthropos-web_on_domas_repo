import {
  RekognitionClient,
  IndexFacesCommand,
  Image as RekognitionImage,
} from '@aws-sdk/client-rekognition';
import sharp from 'sharp';

const rek = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Select collection based on environment (defaults included for safety)
const COLLECTION_ID =
  process.env.NODE_ENV === 'production'
    ? process.env.REKOGNITION_COLLECTION_ID_PROD || 'face_recognition_collection_prod'
    : process.env.REKOGNITION_COLLECTION_ID_DEV || 'face_recognition_collection_dev';

/**
 * Fetches an image from a URL and prepares it for AWS Rekognition.
 * @param url The public URL of the image to process.
 * @returns A promise resolving to an Image object for the Rekognition API.
 */
async function urlToImage(url: string): Promise<RekognitionImage> {
  console.log('[FaceIndex] Fetching image from URL:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    const convertedBuffer = await sharp(Buffer.from(arrayBuffer))
      .jpeg({ quality: 90 })
      .toBuffer();
    
    if (convertedBuffer.byteLength > 5 * 1024 * 1024) {
      throw new Error(`Converted image is too large: ${convertedBuffer.byteLength / (1024 * 1024)}MB. Max 5MB.`);
    }

    console.log('[FaceIndex] Image successfully prepared. Size:', convertedBuffer.byteLength, 'bytes');
    return { Bytes: new Uint8Array(convertedBuffer.buffer) };
  } catch (error: unknown) {
    console.error('[FaceIndex] urlToImage failed:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during image processing.';
    throw new Error(message);
  }
}

/**
 * Indexes a face into the AWS Rekognition collection.
 * This should be called after a user has successfully paid and is being fully activated.
 * @param faceUrl The public URL of the user's face image.
 * @param userId The user's unique profile ID, used as the ExternalImageId in Rekognition.
 * @returns A promise that resolves to the Rekognition Face ID.
 */
export async function indexFace(faceUrl: string, userId: string): Promise<string> {
    const MOCK_FACE_INDEXING = process.env.MOCK_FACE_INDEXING === 'true';
    if (MOCK_FACE_INDEXING) {
        console.log(`--- MOCKING FACE INDEXING for user ${userId} ---`);
        const mockFaceId = `mock-rek-face-id-${userId}`;
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        console.log(`[MOCK] Returning mock Face ID: ${mockFaceId}`);
        return mockFaceId;
    }

    console.log(`[FaceIndex] Starting face indexing for user ${userId}`);
    try {
        const image = await urlToImage(faceUrl);

        const command = new IndexFacesCommand({
            CollectionId: COLLECTION_ID,
            Image: image,
            ExternalImageId: userId, // Link our internal user ID to the Rekognition face
            MaxFaces: 1,
            DetectionAttributes: ['DEFAULT'],
        });

        const response = await rek.send(command);

        if (!response.FaceRecords || response.FaceRecords.length === 0 || !response.FaceRecords[0].Face?.FaceId) {
            console.error('[FaceIndex] Rekognition did not return a Face ID. Full response:', response);
            throw new Error('Face indexing failed on AWS Rekognition side.');
        }

        const faceId = response.FaceRecords[0].Face.FaceId;
        console.log(`[FaceIndex] ✅ Successfully indexed face for user ${userId}. Rekognition Face ID: ${faceId}`);
        
        return faceId;

    } catch (error) {
        console.error(`[FaceIndex] ❌ Failed to index face for user ${userId}:`, error);
        throw new Error(`Could not index face: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
} 