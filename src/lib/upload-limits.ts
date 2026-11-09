// Upload limits, shared by the browser (early feedback) and the server (the check that counts: it reads the file
// back from Cloudinary, so a changed limit in the browser changes nothing).
export const PAYMENT_PROOF_MAX_BYTES = 5 * 1024 * 1024;
// As Cloudinary reports them: a .jpeg upload comes back as "jpg".
export const PAYMENT_PROOF_FORMATS_ALLOWED = ["jpg", "png", "webp", "pdf"] as const;

export const QRIS_MAX_BYTES = 5 * 1024 * 1024;
export const QRIS_FORMATS_ALLOWED = ["jpg", "png", "webp"] as const;
