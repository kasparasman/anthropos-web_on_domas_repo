export {};

declare global {
  interface Window {
    faceIO: {
      new (publicId: string): FaceIOInstance;
    };
    fioErrCode: { [key: string]: number };
  }
}

interface FaceIOInstance {
  enroll(options: Record<string, unknown>): Promise<unknown>;
  authenticate(options: Record<string, unknown>): Promise<unknown>;
  restartSession(): Promise<void>;
} 