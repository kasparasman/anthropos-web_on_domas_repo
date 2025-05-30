/**
 * Uploads a file to R2 storage via a presigned URL obtained from the backend.
 * @param file The file to upload.
 * @returns The public URL of the uploaded file.
 * @throws If any step of the upload process fails.
 */
export async function uploadFileToStorage(file: File): Promise<string> {
  try {
    // 1) Ask backend for presigned URL
    const response = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });

    if (!response.ok) {
      let errorDetails = 'Unknown error';
      try {
        const error = await response.json();
        errorDetails = error.details || error.error || response.statusText;
      } catch (e) {
        errorDetails = response.statusText;
      }
      throw new Error(`Failed to get upload URL: ${errorDetails}`);
    }

    const { uploadUrl, publicUrl } = await response.json();
    console.log('[FileUploadService] Got URLs:', {
      uploadUrl: uploadUrl ? uploadUrl.substring(0, 50) + '...' : 'N/A',
      publicUrl,
      contentType: file.type,
    });

    if (!uploadUrl || !publicUrl) {
      throw new Error('Received invalid URL data from server.');
    }

    // 2) PUT directly to R2
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file to storage: ${uploadResponse.statusText}`);
    }

    // 3) Return the public URL
    console.log('[FileUploadService] File uploaded successfully to:', publicUrl);
    return publicUrl;

  } catch (error: any) {
    console.error('[FileUploadService] Upload error:', error.message);
    // Re-throw with a more specific context if desired, or just the original error.
    // For now, re-throwing a new error to ensure the message is clear.
    throw new Error(`File upload failed: ${error.message}`);
  }
} 