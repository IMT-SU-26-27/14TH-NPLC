"use client";

import { useTransition } from "react";
import { DownloadIcon, FileArchiveIcon } from "lucide-react";
import { toast } from "sonner";
import { downloadPaymentProofsZip, exportRegistrationsXlsx } from "@/lib/actions/admin-registrations";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/types";

// Saves a file a Server Action returned as base64.
function saveBase64(data: string, name: string, type: string) {
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

// Finance asked (23 Nov) for the team list as a spreadsheet and every payment proof in one download.
export function RegistrationsExport() {
  const [xlsxPending, startXlsx] = useTransition();
  const [zipPending, startZip] = useTransition();
  const { t } = useI18n();

  // The date is read on click, not during render: reading the clock while rendering makes Next (Cache Components)
  // drop this page's server-rendered content on a full load, leaving it blank.
  function download(action: () => Promise<ActionResult<string>>, base: string, ext: string, type: string) {
    return async () => {
      const result = await action();
      if (result.ok) saveBase64(result.data, `${base}-${new Date().toISOString().slice(0, 10)}.${ext}`, type);
      else toast.error(t(result.message));
    };
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          startXlsx(
            download(exportRegistrationsXlsx, "pendaftaran-nplc", "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
          )
        }
        disabled={xlsxPending}
        title={t("admin.registrations.exportHint")}
      >
        {xlsxPending ? <Spinner /> : <DownloadIcon />}
        {t("admin.registrations.exportXlsx")}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => startZip(download(downloadPaymentProofsZip, "bukti-transfer-nplc", "zip", "application/zip"))}
        disabled={zipPending}
      >
        {zipPending ? <Spinner /> : <FileArchiveIcon />}
        {t("admin.registrations.downloadProofs")}
      </Button>
    </>
  );
}
