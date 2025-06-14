"use client";

/**
 * Stream-uploads a File directly to Cloudflare R2 using a one-time presigned
 * PUT URL provided by the server.  Eliminates the base64 inflation and the
 * double-buffering problem.
 *
 * @param file – the browser File object to upload.
 * @param purpose – a prefix such as 'tmp', 'avatars', or 'userfaceimage'. Defaults to 'tmp'.
 * @returns The public URL of the newly-uploaded object.
 * @throws If the upload fails at any stage.
 */
export async function uploadFileToStorage(
  file: File,
  /** Prefix such as 'tmp', 'avatars', or 'userfaceimage'. Defaults to 'tmp'. */
  purpose: string = 'tmp'
): Promise<string> {
  interface SignResponse {
    uploadUrl: string;
    publicUrl?: string;
    key: string;
  }

  try {
    // 1. Ask our server for a presigned PUT URL.
    const signRes = await fetch("/api/sign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, purpose }),
    });

    if (!signRes.ok) {
      const err = (await signRes.json()) as { error?: string };
      throw new Error(err.error || "Failed to obtain upload URL");
    }

    const { uploadUrl, publicUrl, key } = (await signRes.json()) as SignResponse;

    // 2. PUT the file directly to R2.  Using fetch keeps memory footprint low
    //    and allows streaming.  We forward the original MIME type.
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error(`Upload failed with status ${putRes.status}`);
    }

    // Note: fetch() does not expose progress events; switch to XMLHttpRequest
    // if real-time progress UI is needed.  For now we log when it finishes.
    if (publicUrl) {
      console.log("[FileUploadService] File uploaded successfully to:", publicUrl);
      return publicUrl;
    }

    // For private uploads we only have the object key; the caller will need to
    // request a signed GET URL later to display it.
    console.log("[FileUploadService] Private file uploaded with key:", key);
    return key;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[FileUploadService] Upload error:", message);
    throw new Error(`File upload failed: ${message}`);
  }
} 