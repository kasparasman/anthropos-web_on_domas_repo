import { apiPost } from './apiUtils';
import { firebaseAuth } from '../firebase-client'; // Corrected import path

// Types for request/response payloads should be defined here or imported
// For example:
interface FaceCheckRequest {
  imageUrl: string;
  email: string;
}

interface FaceCheckResponse {
  // Define expected response structure, e.g., { isUnique: boolean } or {} if no body on success
  message?: string; // Or specific fields
}

interface ProfileUpdateRequest {
  avatarUrl?: string;
  nickname?: string;
  // other fields as needed
}

interface ProfileUpdateResponse {
  // Define expected response structure
  message?: string;
}


// Functions to interact with authentication-related API endpoints

export const checkFaceDuplicate = async (data: FaceCheckRequest): Promise<FaceCheckResponse> => {
  return apiPost<FaceCheckRequest, FaceCheckResponse>('/api/check-face-duplicate', data);
};

export const updateProfile = async (data: ProfileUpdateRequest): Promise<ProfileUpdateResponse> => {
  return apiPost<ProfileUpdateRequest, ProfileUpdateResponse>('/api/profile/update', data);
};

// New function to get current user's ID token
export const getCurrentUserIdToken = async (): Promise<string | null> => {
  const currentUser = firebaseAuth.currentUser; // Use imported firebaseAuth
  if (currentUser) {
    try {
      return await currentUser.getIdToken(true); // true to force refresh the token
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  }
  console.warn("getCurrentUserIdToken called but no current user found.");
  return null;
};

// Add other auth-related API calls here, e.g.:
// - provisionalRegister
// - completeRegistrationSession (if it becomes a direct API call)
// - login (if you decide to wrap NextAuth's signIn with a direct API call for some reason) 