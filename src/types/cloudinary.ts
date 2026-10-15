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
};

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
