"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/hooks/use-i18n";

export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  async function copy(text: string, label = t("common.copied")) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(label);
      setTimeout(() => setCopied(false), resetAfterMs);
    } catch {
      toast.error(t("common.copyFailed"));
    }
  }

  return { copied, copy };
}
