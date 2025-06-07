/**
 * Converts a File object to a base64 encoded string.
 * This implementation is safe for both Browser and Node.js environments.
 * @param file The File object to convert.
 * @returns A promise that resolves with the base64 encoded string.
 */
export async function fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
}

/**
 * Converts a Blob object to a base64 encoded string.
 * This implementation is safe for both Browser and Node.js environments.
 * @param blob The Blob object to convert.
 * @returns A promise that resolves with the base64 encoded string.
 */
export async function blobToBase64(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
} 