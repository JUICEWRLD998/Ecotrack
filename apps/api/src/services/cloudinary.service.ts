export type UploadSignature = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
};

export function createUploadSignature(): UploadSignature {
  throw new Error("Cloudinary upload signing is implemented in Phase 3.");
}
