"use client";

import { ArchiveRestoreIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { FormDraftBannerProps } from "@/types/form-draft";

export function FormDraftBanner({ hasFiles = false, onDiscard }: FormDraftBannerProps) {
  const { t } = useI18n();

  return (
    <Alert>
      <ArchiveRestoreIcon />
      <AlertTitle>{t("draft.restoredTitle")}</AlertTitle>
      <AlertDescription>
        {t(hasFiles ? "draft.restoredWithFiles" : "draft.restored")}
        {/* Below the text, not in the corner: a corner button squeezes the text into a narrow column on phones. */}
        <div className="mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onDiscard}>
            {t("draft.discard")}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
