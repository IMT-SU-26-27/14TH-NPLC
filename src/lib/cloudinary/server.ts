import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { getServerEnv } from "@/lib/server-env";
import type { CloudinaryDeliveryType, CloudinaryUploadSignature } from "@/types/cloudinary";

export const CLOUDINARY_ROOT = "14th-nplc";
export const paymentProofFolder = (registrationId: string) => `${CLOUDINARY_ROOT}/payment-proofs/${registrationId}`;
// Proofs uploaded while registering, before the team (and its id) exists.
export const newRegistrationProofFolder = (userId: string) => `${CLOUDINARY_ROOT}/payment-proofs/new/${userId}`;
export const QRIS_FOLDER = `${CLOUDINARY_ROOT}/qris`;

function client() {
  const env = getServerEnv();
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

// Signs a direct browser upload. folder/type/allowed_formats are part of the signature,
// so the browser cannot change where the file goes or what it is.
export function signUpload(folder: string, type: CloudinaryDeliveryType, allowedFormats: string): CloudinaryUploadSignature {
  const env = getServerEnv();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, type, allowed_formats: allowedFormats, timestamp };
  const signature = client().utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder,
    type,
    allowedFormats,
  };
}

// Confirms an uploaded asset really exists with the expected delivery type.
export async function assetExists(publicId: string, type: CloudinaryDeliveryType): Promise<boolean> {
  try {
    await client().api.resource(publicId, { type, resource_type: "image" });
    return true;
  } catch {
    return false;
  }
}

export async function deleteAsset(publicId: string, type: CloudinaryDeliveryType): Promise<void> {
  try {
    await client().uploader.destroy(publicId, { type, resource_type: "image", invalidate: true });
  } catch {
    // A leftover file is harmless; never block the user's action on cleanup.
  }
}

export function publicImageUrl(publicId: string): string {
  return client().url(publicId, { secure: true, fetch_format: "auto", quality: "auto" });
}

// Expiring link to a private (authenticated) payment proof. Callers must check access first.
export function privateAssetUrl(publicId: string, format: string, ttlSeconds = 600): string {
  return client().utils.private_download_url(publicId, format, {
    type: "authenticated",
    resource_type: "image",
    expires_at: Math.round(Date.now() / 1000) + ttlSeconds,
  });
}
