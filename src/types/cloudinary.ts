import type { ActionResult } from "@/types";

export type CloudinaryDeliveryType = "upload" | "authenticated";

export type CloudinaryUploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  type: CloudinaryDeliveryType;
  allowedFormats: string;
  // Signed too: puts the folder in front of the public_id on dynamic-folder accounts (see signUpload).
  useAssetFolderAsPublicIdPrefix: true;
};

export type UploadRules = {
  maxBytes: number;
  formats: readonly string[];
};

// The server's verdict on an uploaded file, read back from Cloudinary.
export type UploadCheck = { ok: true; format: string; bytes: number } | { ok: false; reason: "missing" | "tooLarge" | "format" };

export type CloudinaryUploadResult = {
  publicId: string;
  format: string;
};

export type GetUploadSignature = () => Promise<ActionResult<CloudinaryUploadSignature>>;

export type UseCloudinaryUploadOptions = {
  getSignature: GetUploadSignature;
  maxBytes: number;
  accept: string[];
};
