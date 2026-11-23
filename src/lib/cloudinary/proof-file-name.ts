// The name a proof gets inside the ZIP from privateArchiveUrl, so the exported sheet can point to it.
export function proofFileName(publicId: string, format: string | null): string {
  const base = publicId.slice(publicId.lastIndexOf("/") + 1);
  return format ? `${base}.${format}` : base;
}
