declare module '@faceio/fiojs' {
  interface FaceIOUserInfo {
    facialId: string;
    timestamp: string;
    details?: {
      gender?: string;
      age?: string;
    };
  }

  interface FaceIOAuthData {
    facialId: string;
    payload?: Record<string, unknown>;
  }

  interface FaceIOEnrollOptions {
    userConsent?: boolean;
    locale?: string;
    payload?: Record<string, unknown>;
    permissionTimeout?: number;
    termsTimeout?: number;
    idleTimeout?: number;
    replyTimeout?: number;
    enrollIntroTimeout?: number;
  }

  interface FaceIOAuthOptions {
    locale?: string;
    permissionTimeout?: number;
    idleTimeout?: number;
    replyTimeout?: number;
  }

  interface FaceIOErrorCodes {
    PERMISSION_REFUSED: number;
    NO_FACES_DETECTED: number;
    UNRECOGNIZED_FACE: number;
    MANY_FACES: number;
    FACE_DUPLICATION: number;
    MINORS_NOT_ALLOWED: number;
    PAD_ATTACK: number;
    FACE_MISMATCH: number;
    WRONG_PIN_CODE: number;
    PROCESSING_ERR: number;
    UNAUTHORIZED: number;
    TERMS_NOT_ACCEPTED: number;
    UI_NOT_READY: number;
    SESSION_EXPIRED: number;
    TIMEOUT: number;
    TOO_MANY_REQUESTS: number;
    EMPTY_ORIGIN: number;
    FORBIDDDEN_ORIGIN: number;
    FORBIDDDEN_COUNTRY: number;
    SESSION_IN_PROGRESS: number;
    NETWORK_IO: number;
  }

  class faceIO {
    constructor(publicId: string);
    enroll(options?: FaceIOEnrollOptions): Promise<FaceIOUserInfo>;
    authenticate(options?: FaceIOAuthOptions): Promise<FaceIOAuthData>;
    restartSession(): Promise<boolean>;
    fetchAllErrorCodes(): FaceIOErrorCodes;
  }

  export default faceIO;
} 