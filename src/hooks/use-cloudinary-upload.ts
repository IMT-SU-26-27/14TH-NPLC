"use client";

import { useState } from "react";
import type { CloudinaryUploadResult, UseCloudinaryUploadOptions } from "@/types/cloudinary";

// Uploads one file straight to Cloudinary with a server-issued signature, reporting progress.
// `error` is a dictionary key; `errorParams` fills its placeholders.
export function useCloudinaryUpload({ getSignature, maxBytes, accept }: UseCloudinaryUploadOptions) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorParams, setErrorParams] = useState<Record<string, number>>();

  async function upload(file: File): Promise<CloudinaryUploadResult | null> {
    setError(null);
    if (!accept.includes(file.type)) {
      setError("errors.fileType");
      return null;
    }
    if (file.size > maxBytes) {
      setErrorParams({ size: Math.round(maxBytes / 1024 / 1024) });
      setError("errors.fileTooLarge");
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
            setError(res.error?.message ?? "errors.uploadFailed");
            resolve(null);
          }
        };
        xhr.onerror = () => {
          setError("errors.uploadConnection");
          resolve(null);
        };
        xhr.send(body);
      });
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, progress, error, errorParams };
}
