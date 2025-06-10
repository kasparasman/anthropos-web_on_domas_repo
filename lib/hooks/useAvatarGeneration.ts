import { useState, useCallback } from 'react';
import { generateAvatarStream, fetchNickname } from '../lib/services/avatarApiService'; // Correct path

interface AvatarGenerationState {
  generatedAvatarUrl: string | null; // Can be base64 during generation, then CDN URL
  finalCdnUrl: string | null; // Specifically the final uploaded CDN URL
  nickname: string | null;
  streamingProgress: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AvatarGenerationState = {
  generatedAvatarUrl: null,
  finalCdnUrl: null,
  nickname: null,
  streamingProgress: null,
  isLoading: false,
  error: null,
};

export function useAvatarGeneration() {
  const [state, setState] = useState<AvatarGenerationState>(initialState);

  const generateAvatarAndNickname = useCallback(async (selfieFile: File | null, selfieUrlFallback: string | null, styleRefUrl: string, gender: 'male' | 'female') => {
    setState({ ...initialState, isLoading: true, streamingProgress: 'Preparing images...' });
    
    let selfieToProcessBase64: string;
    try {
      // 1. Prepare selfie image as Base64
      if (selfieFile) {
        selfieToProcessBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = (err) => reject(new Error('Failed to read selfie file.'));
          reader.readAsDataURL(selfieFile);
        });
      } else if (selfieUrlFallback) {
        // This is more complex: fetch the image from URL, then convert to Base64
        // For simplicity, this part often benefits from a backend helper or careful CORS handling
        // Assuming selfieUrlFallback IS a base64 string if selfieFile is null, or this needs more work.
        // OR, the backend /api/avatar-gen should be ableto accept a URL directly.
        // For now, let's assume if selfieFile is null, selfieUrlFallback is a base64 data URL or just the base64 part.
        // This is a common simplification/assumption in frontend examples for this step.
        // To make it robust, if it's a raw URL, it needs fetching:
        // const response = await fetch(selfieUrlFallback);
        // const blob = await response.blob();
        // selfieToProcessBase64 = await new Promise(...);
        // For now, placeholder if it's a URL that needs fetching:
        if (selfieUrlFallback.startsWith('http')) {
            console.warn("[useAvatarGeneration] Fallback URL is an HTTP URL, direct Base64 conversion not implemented in this hook's simple version.");
            // throw new Error("Selfie URL fallback requires direct base64 or further implementation for fetching.");
            // Simulating a fetch and convert for placeholder purposes - replace with robust solution
            const httpResponse = await fetch(selfieUrlFallback);
            if (!httpResponse.ok) throw new Error ('Failed to fetch selfie fallback image');
            const blob = await httpResponse.blob();
            selfieToProcessBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = (err) => reject(new Error('Failed to read fetched selfie image.'));
                reader.readAsDataURL(blob);
            });
        } else {
             selfieToProcessBase64 = selfieUrlFallback.includes(',') ? selfieUrlFallback.split(',')[1] : selfieUrlFallback;
        }
      } else {
        throw new Error('No selfie image provided for avatar generation.');
      }

      // 2. Get style image as Base64
      setState(s => ({ ...s, streamingProgress: 'Fetching style...' }));
      const styleResp = await fetch(styleRefUrl);
      if (!styleResp.ok) throw new Error('Failed to fetch style image.');
      const styleBlob = await styleResp.blob();
      const styleBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (err) => reject(new Error('Failed to read style file.'));
        reader.readAsDataURL(styleBlob);
      });

      // 3. Start streaming avatar generation
      setState(s => ({ ...s, streamingProgress: 'Initializing generation...' }));
      const streamResponse = await generateAvatarStream({ selfieBase64: selfieToProcessBase64, styleBase64 });
      
      if (!streamResponse.body) throw new Error('No response body from avatar generation stream.');

      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedFinalCdnUrl: string | null = null;

      setState(s => ({ ...s, streamingProgress: 'Generating avatar...' }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || '';

        for (const message of messages) {
          if (!message.trim()) continue; // Skip empty messages
          
          const lines = message.split('\n');
          const currentEvent: { event?: string; data?: string; id?: string } = {};
          for (const line of lines) {
            if (line.startsWith('event: ')) currentEvent.event = line.substring(7);
            else if (line.startsWith('data: ')) currentEvent.data = line.substring(6);
            else if (line.startsWith('id: ')) currentEvent.id = line.substring(4);
          }

          console.log('[useAvatarGeneration] Received SSE event:', currentEvent);

          if (currentEvent.event) {
            switch (currentEvent.event) {
              case 'partial':
                const partialIndex = currentEvent.id ? parseInt(currentEvent.id) + 1 : '...';
                setState(s => ({
                  ...s,
                  generatedAvatarUrl: `data:image/png;base64,${currentEvent.data}`,
                  streamingProgress: `Refining... (${partialIndex})`,
                }));
                break;
              case 'complete': // This is the final generated image (base64)
                console.log('[useAvatarGeneration] Complete event received');
                setState(s => ({
                  ...s,
                  generatedAvatarUrl: `data:image/png;base64,${currentEvent.data}`,
                  streamingProgress: 'Finalizing image...',
                }));
                break;
              case 'uploaded': // This is the CDN URL after upload
                console.log('[useAvatarGeneration] Uploaded event received with URL:', currentEvent.data);
                receivedFinalCdnUrl = currentEvent.data || null; // Ensure null if undefined
                setState(s => ({
                  ...s,
                  generatedAvatarUrl: currentEvent.data || null, // Ensure null if undefined
                  finalCdnUrl: currentEvent.data || null, // Ensure null if undefined
                  streamingProgress: 'Fetching nickname...',
                }));
                break;
              case 'error':
                throw new Error(currentEvent.data || 'Avatar generation stream reported an error.');
              case 'done':
                console.log('[useAvatarGeneration] Done event received, finalCdnUrl:', receivedFinalCdnUrl);
                // Stream finished, but wait for nickname if finalCdnUrl is available
                break;
            }
          }
        }
      }
      
      if (!receivedFinalCdnUrl) {
        throw new Error('Avatar generation completed but no CDN URL was received.');
      }

      // 4. Fetch nickname
      const nicknameData = await fetchNickname({ avatarUrl: receivedFinalCdnUrl, gender });
      setState(s => ({
        ...s,
        nickname: nicknameData.nickname,
        isLoading: false,
        streamingProgress: null,
        error: null,
      }));

    } catch (err) {
      console.error('[useAvatarGeneration] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Avatar generation process failed.';
      setState(s => ({ ...s, isLoading: false, error: errorMessage, streamingProgress: null }));
    }
  }, []);

  const resetAvatarGenerationState = useCallback(() => {
    setState(initialState);
  }, []);

  return { state, generateAvatarAndNickname, resetAvatarGenerationState };
} 