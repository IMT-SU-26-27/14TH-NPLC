"use client";

import { useTransition } from "react";
import { DownloadIcon, FileArchiveIcon } from "lucide-react";
import { toast } from "sonner";
import { exportRegistrationsCsv, getPaymentProofsZipUrl } from "@/lib/actions/admin-registrations";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Finance asked (23 Nov) for the team list as a sheet and every payment proof in one download.
export function RegistrationsExport() {
  const [csvPending, startCsv] = useTransition();
  const [zipPending, startZip] = useTransition();
  const { t } = useI18n();

  function downloadCsv() {
    startCsv(async () => {
      const result = await exportRegistrationsCsv();
      if (!result.ok) {
        toast.error(t(result.message));
        return;
      }
      const url = URL.createObjectURL(new Blob([result.data], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `pendaftaran-nplc-${new Date().toISOString().slice(0, 10)}.csv`;
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
      <Button type="button" variant="outline" onClick={downloadCsv} disabled={csvPending} title={t("admin.registrations.exportHint")}>
        {csvPending ? <Spinner /> : <DownloadIcon />}
        {t("admin.registrations.exportCsv")}
      </Button>
      <Button type="button" variant="outline" onClick={downloadZip} disabled={zipPending}>
        {zipPending ? <Spinner /> : <FileArchiveIcon />}
        {t("admin.registrations.downloadProofs")}
      </Button>
    </>
  );
}
