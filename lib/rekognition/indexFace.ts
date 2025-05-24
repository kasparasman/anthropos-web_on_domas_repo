import {
    RekognitionClient,
    SearchFacesByImageCommand,
    IndexFacesCommand,
    CreateCollectionCommand,
    Image,
  } from '@aws-sdk/client-rekognition'
  
  const rek = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
  
  const COLLECTION_ID = 'face_recognition_collection'
  const SIMILARITY    = 98   // %
  
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
          Image:        image,
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
          CollectionId:    COLLECTION_ID,
          Image:           image,
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
  