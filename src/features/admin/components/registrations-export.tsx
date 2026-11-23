"use client";

import { useTransition } from "react";
import { DownloadIcon, FileArchiveIcon } from "lucide-react";
import { toast } from "sonner";
import { exportRegistrationsXlsx, getPaymentProofsZipUrl } from "@/lib/actions/admin-registrations";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Finance asked (23 Nov) for the team list as a sheet and every payment proof in one download.
export function RegistrationsExport() {
  const [xlsxPending, startXlsx] = useTransition();
  const [zipPending, startZip] = useTransition();
  const { t } = useI18n();

  function downloadXlsx() {
    startXlsx(async () => {
      const result = await exportRegistrationsXlsx();
      if (!result.ok) {
        toast.error(t(result.message));
        return;
      }
      const bytes = Uint8Array.from(atob(result.data), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `pendaftaran-nplc-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  function downloadZip() {
    startZip(async () => {
      const result = await getPaymentProofsZipUrl();
      if (result.ok) window.location.href = result.data;
      else toast.error(t(result.message));
    });
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={downloadXlsx} disabled={xlsxPending} title={t("admin.registrations.exportHint")}>
        {xlsxPending ? <Spinner /> : <DownloadIcon />}
        {t("admin.registrations.exportXlsx")}
      </Button>
      <Button type="button" variant="outline" onClick={downloadZip} disabled={zipPending}>
        {zipPending ? <Spinner /> : <FileArchiveIcon />}
        {t("admin.registrations.downloadProofs")}
      </Button>
    </>
  );
}
