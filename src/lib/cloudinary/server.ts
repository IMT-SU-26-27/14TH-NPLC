import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { getServerEnv } from "@/lib/server-env";
import type { CloudinaryDeliveryType, CloudinaryUploadSignature, UploadCheck, UploadRules } from "@/types/cloudinary";

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

// Signs a direct browser upload. folder/type/allowed_formats are part of the signature, so the browser cannot change
// where the file goes or what it is. Accounts differ in what `folder` does: on fixed-folder accounts (and older
// dynamic ones) it is the public_id prefix; on newer dynamic-folder accounts it only sets the asset folder and the
// public_id comes back as a bare random string. use_asset_folder_as_public_id_prefix asks those accounts for the
// prefix as well; verifyUpload accepts either way of being in the folder.
export function signUpload(folder: string, type: CloudinaryDeliveryType, allowedFormats: string): CloudinaryUploadSignature {
  const env = getServerEnv();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, type, allowed_formats: allowedFormats, use_asset_folder_as_public_id_prefix: true, timestamp };
  const signature = client().utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder,
    type,
    allowedFormats,
    useAssetFolderAsPublicIdPrefix: true,
  };
}

// Reads an uploaded file back from Cloudinary with the server's credentials and checks it: it exists with this
// delivery type, it is in the signed folder (public_id prefix, or asset folder on dynamic-folder accounts), and its
// real format and size are allowed. The browser's own checks can be changed by the user; these can't. A rejected
// file in the folder is deleted. The format to store is the one Cloudinary reports, not the browser's.
export async function verifyUpload(publicId: string, type: CloudinaryDeliveryType, folder: string, rules: UploadRules): Promise<UploadCheck> {
  let info: { public_id: string; asset_folder?: string; format: string; bytes: number };
  try {
    info = await client().api.resource(publicId, { type, resource_type: "image" });
  } catch {
    return { ok: false, reason: "missing" };
  }
  const inFolder = info.public_id.startsWith(`${folder}/`) || info.asset_folder === folder;
  if (!inFolder) return { ok: false, reason: "missing" };
  if (!rules.formats.includes(info.format)) {
    await deleteAsset(publicId, type);
    return { ok: false, reason: "format" };
  }
  if (info.bytes > rules.maxBytes) {
    await deleteAsset(publicId, type);
    return { ok: false, reason: "tooLarge" };
  }
  return { ok: true, format: info.format, bytes: info.bytes };
}

// The message key for a rejected upload.
export function uploadErrorKey(reason: "missing" | "tooLarge" | "format"): string {
  return { missing: "errors.uploadMissing", tooLarge: "errors.uploadTooLarge", format: "errors.uploadFormat" }[reason];
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

// Expiring link to a private (authenticated) payment or twibbon proof. Callers must check access first.
export function privateAssetUrl(publicId: string, format: string, ttlSeconds = 600): string {
  return client().utils.private_download_url(publicId, format, {
    type: "authenticated",
    resource_type: "image",
    expires_at: Math.round(Date.now() / 1000) + ttlSeconds,
  });
}
