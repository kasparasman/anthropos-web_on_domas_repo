export async function uploadAvatar(file: File) {
  try {
    // 1) ask backend for presigned URL
    const response = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to get upload URL: ${error.details || error.error || response.statusText}`)
    }

    const { uploadUrl, publicUrl } = await response.json()
    console.log('📤 Got URLs:', { 
      uploadUrl: uploadUrl.substring(0, 50) + '...',
      publicUrl,
      contentType: file.type
    })

    // 2) PUT directly to R2
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`)
    }

    // 3) Return the URL without verification since the image might need time to propagate
    console.log('✅ File uploaded successfully to:', publicUrl)
    return publicUrl

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }
}
  