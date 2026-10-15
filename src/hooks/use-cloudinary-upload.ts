"use client";

import { useState } from "react";
import type { CloudinaryUploadResult, UseCloudinaryUploadOptions } from "@/types/cloudinary";

// Uploads one file straight to Cloudinary with a server-issued signature, reporting progress.
export function useCloudinaryUpload({ getSignature, maxBytes, accept }: UseCloudinaryUploadOptions) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<CloudinaryUploadResult | null> {
    setError(null);
    if (!accept.includes(file.type)) {
      setError("Use a JPG, PNG, WEBP or PDF file");
      return null;
    }
    if (file.size > maxBytes) {
      setError(`The file is larger than ${Math.round(maxBytes / 1024 / 1024)} MB`);
      return null;
    }

    setUploading(true);
    setProgress(0);
    try {
      const signed = await getSignature();
      if (!signed.ok) {
        setError(signed.message);
        return null;
      }
      const s = signed.data;
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", s.apiKey);
      body.append("timestamp", String(s.timestamp));
      body.append("signature", s.signature);
      body.append("folder", s.folder);
      body.append("type", s.type);
      body.append("allowed_formats", s.allowedFormats);

      return await new Promise<CloudinaryUploadResult | null>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          const res = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ publicId: res.public_id, format: res.format });
          } else {
            setError(res.error?.message ?? "Upload failed. Try again.");
            resolve(null);
          }
        };
        xhr.onerror = () => {
          setError("Upload failed. Check your connection and try again.");
          resolve(null);
        };
        xhr.send(body);
      });
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, progress, error };
}
