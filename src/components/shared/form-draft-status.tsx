"use client";

import { CloudCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimeOfDay } from "@/lib/format";
import { useI18n } from "@/hooks/use-i18n";
import type { FormDraftStatusProps } from "@/types/form-draft";

export function FormDraftStatus({ savedAt, className }: FormDraftStatusProps) {
  const { t, lang } = useI18n();
  if (savedAt === null) return null;

  return (
    <p className={cn("text-muted-foreground flex items-center gap-1.5 text-xs", className)}>
      <CloudCheckIcon aria-hidden className="size-3.5 shrink-0" />
      {t("draft.saved", { time: formatTimeOfDay(savedAt, lang) })}
    </p>
  );
}
