"use client";

import { cn } from "@/lib/utils";
import { formatTimeOfDay } from "@/lib/format";
import { useI18n } from "@/hooks/use-i18n";
import type { FormDraftStatusProps } from "@/types/form-draft";

export function FormDraftStatus({ savedAt, className }: FormDraftStatusProps) {
  const { t, lang } = useI18n();
  if (savedAt === null) return null;

  return (
    <p className={cn("text-muted-foreground flex items-center gap-2 font-mono text-[11px] leading-4 tracking-[0.1em] uppercase", className)}>
      <span aria-hidden className="bg-success ring-success/15 size-[7px] shrink-0 rounded-full ring-[3px]" />
      {t("draft.saved", { time: formatTimeOfDay(savedAt, lang) })}
    </p>
  );
}
