import { apiPost } from './apiUtils';

// Types for request/response payloads
interface AvatarGenerationRequest {
  selfieBase64: string;
  styleBase64: string;
}

// The response for avatar generation is a stream, handled differently.
// This service might not return a parsed JSON for the main generation endpoint,
// but rather initiate the stream and provide ways to handle SSE events.
// However, we can define types for what we expect *from* the stream events.

interface NicknameRequest {
  avatarUrl: string;
}

interface NicknameResponse {
  nickname: string;
}

export const generateAvatarStream = async (data: AvatarGenerationRequest): Promise<Response> => {
  // This function returns the raw Response object so the caller can handle the SSE stream
  return fetch('/api/avatar-gen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  // The caller (e.g., useAvatarGeneration hook) will be responsible for:
  // - response.body.getReader()
  // - TextDecoder
  // - Parsing SSE messages
};

export const fetchNickname = async (data: NicknameRequest): Promise<NicknameResponse> => {
  return apiPost<NicknameRequest, NicknameResponse>('/api/nickname', data);
}; 