"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false);

  async function copy(text: string, label = "Copied") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(label);
      setTimeout(() => setCopied(false), resetAfterMs);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  }

  return { copied, copy };
}
