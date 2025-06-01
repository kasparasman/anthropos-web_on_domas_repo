import { admin } from '../firebase-admin';
import { prisma } from '../prisma';
import { 
  RekognitionClient, 
  IndexFacesCommand,
  CreateCollectionCommand,
  Image
} from '@aws-sdk/client-rekognition';
import sharp from 'sharp';

// Initialize Rekognition client
const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Collection for deleted accounts
const DELETED_COLLECTION_ID = process.env.REKOGNITION_DELETED_COLLECTION_ID || 'anthropos_deleted_faces';

// Helper to convert URL to image bytes for AWS Rekognition
async function urlToImageBytes(url: string): Promise<Image> {
  console.log('[Deletion] Fetching image from URL:', url);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('[Deletion] Image size:', arrayBuffer.byteLength, 'bytes');
    
    // Convert to JPEG with sharp
    const buffer = Buffer.from(arrayBuffer);
    const convertedBuffer = await sharp(buffer)
      .jpeg({ quality: 90 })
      .resize({ width: 2048, height: 2048, fit: 'inside' })
      .toBuffer();
    
    return { Bytes: new Uint8Array(convertedBuffer) };
  } catch (error) {
    console.error('[Deletion] Failed to process image:', error);
    throw new Error('Failed to process image for face recognition');
  }
}

// Ensure the deleted faces collection exists
async function ensureDeletedCollection() {
  try {
    await rekognition.send(new CreateCollectionCommand({ 
      CollectionId: DELETED_COLLECTION_ID
    }));
    console.log(`[Deletion] Created collection: ${DELETED_COLLECTION_ID}`);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ResourceAlreadyExistsException') {
      console.log(`[Deletion] Collection already exists: ${DELETED_COLLECTION_ID}`);
    } else {
      console.error(`[Deletion] Error creating collection:`, err);
      throw err;
    }
  }
}

/**
 * Delete a user account across all systems
 * - Marks profile as DELETED in database
 * - Anonymizes personal data
 * - Adds face to blacklist collection in AWS Rekognition
 * - Disables Firebase account
 */
export async function deleteUserAccount(userId: string, reason?: string): Promise<boolean> {
  console.log(`[Deletion] Starting account deletion for user: ${userId}`);
  
  try {
    // 1. Get user profile with rekFaceId
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        rekFaceId: true,
        nickname: true,
        stripeCustomerId: true,
        tmpFaceUrl: true,
        avatarUrl: true
      }
    });
    
    if (!profile) {
      console.error(`[Deletion] Profile not found for userId: ${userId}`);
      return false;
    }

    console.log(`[Deletion] Found profile for deletion: ${profile.email}`);
    
    // 2. Update database - mark as deleted but KEEP the record
    const anonymizedEmail = `deleted-${userId.substring(0, 8)}@deleted.anthropos.city`;
    
    await prisma.profile.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
        deletionReason: reason || 'User requested deletion',
        // Anonymize personal data
        email: anonymizedEmail,
        nickname: null,
        avatarUrl: null,
        tmpFaceUrl: null,
        // IMPORTANT: Keep rekFaceId to maintain blacklist reference
      }
    });
    
    console.log(`[Deletion] Updated profile status to DELETED: ${userId}`);
    
    // 3. If face exists, add to deleted faces collection
    if (profile.rekFaceId) {
      try {
        console.log(`[Deletion] Adding face to blacklist for userId: ${userId}`);
        
        // Ensure the deleted collection exists
        await ensureDeletedCollection();
        
        // We need the face image to add to the blacklist collection
        // Ideally we'd keep the S3 path/URL in the profile, but for now we can try to fetch from Firebase
        const firebaseUser = await admin.auth().getUser(userId);
        let faceImageUrl = profile.tmpFaceUrl;
        
        // If we have a face ID but no URL, we can't blacklist it properly
        // In a production system, you'd store S3 paths in the profile record
        if (!faceImageUrl) {
          console.warn(`[Deletion] No face URL found for userId: ${userId}`);
          // Try to use photoURL from Firebase as fallback
          faceImageUrl = firebaseUser.photoURL || null;
          
          if (!faceImageUrl) {
            console.error(`[Deletion] Cannot blacklist face - no image URL available`);
          }
        }
        
        // If we have a face image URL, add it to the blacklist
        if (faceImageUrl) {
          console.log(`[Deletion] Processing face image for blacklist: ${faceImageUrl}`);
          
          // Convert URL to image format Rekognition can use
          const image = await urlToImageBytes(faceImageUrl);
          
          // Add to the deleted faces collection
          const result = await rekognition.send(
            new IndexFacesCommand({
              CollectionId: DELETED_COLLECTION_ID,
              Image: image,
              ExternalImageId: `deleted-${userId}`,
              DetectionAttributes: []
            })
          );
          
          console.log(`[Deletion] Successfully added face to blacklist collection. FaceId: ${result.FaceRecords?.[0]?.Face?.FaceId}`);
        }
      } catch (rekErr) {
        // Log but don't fail the whole deletion if face blacklisting fails
        console.error(`[Deletion] Failed to blacklist face: `, rekErr);
      }
    } else {
      console.log(`[Deletion] No face ID found for user, skipping face blacklisting: ${userId}`);
    }
    
    // 4. Disable Firebase account
    await admin.auth().updateUser(userId, {
      disabled: true,
    });
    
    console.log(`[Deletion] Disabled Firebase account: ${userId}`);
    
    // 5. Handle Stripe customer if applicable
    if (profile.stripeCustomerId) {
      // In a full implementation, this would cancel subscriptions
      console.log(`[Deletion] Stripe customer ID found: ${profile.stripeCustomerId} - would cancel subscriptions in production`);
      // You would add Stripe cancellation code here
    }
    
    console.log(`[Deletion] Successfully completed account deletion for: ${userId}`);
    return true;
  } catch (error) {
    console.error(`[Deletion] Error deleting user account:`, error);
    return false;
  }
} 