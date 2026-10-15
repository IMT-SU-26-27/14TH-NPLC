"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { QrCodeIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { getQrisUploadSignature, setCompetitionQris } from "@/lib/actions/admin-competitions";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import type { QrisUploaderProps } from "@/types/admin";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function QrisUploader({ competitionId, qrisUrl }: QrisUploaderProps) {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [saving, startSaving] = useTransition();
  const { upload, uploading, progress, error, errorParams } = useCloudinaryUpload({
    getSignature: getQrisUploadSignature,
    maxBytes: 5 * 1024 * 1024,
    accept: ACCEPT,
  });
  const busy = uploading || saving;

  async function handleUpload() {
    if (!file) return;
    const uploaded = await upload(file);
    if (!uploaded) return;
    startSaving(async () => {
      const result = await setCompetitionQris({ competitionId, publicId: uploaded.publicId });
      if (result.ok) {
        toast.success(t(result.message ?? "admin.competitions.qrisUpdated"));
        setFile(null);
      } else toast.error(t(result.message));
    });
  }

  return (
    <div className="grid gap-6">
      {qrisUrl ? (
        <Image src={qrisUrl} alt={t("admin.competitions.qris")} width={384} height={384} className="bg-card aspect-square w-full max-w-64 rounded-lg border object-contain" />
      ) : (
        <Empty className="border p-4">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <QrCodeIcon />
            </EmptyMedia>
            <EmptyTitle>{t("admin.competitions.noQris")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="qris">{qrisUrl ? t("admin.competitions.qrisReplace") : t("admin.competitions.qrisUpload")}</FieldLabel>
        <Input id="qris" type="file" accept={ACCEPT.join(",")} disabled={busy} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <FieldDescription>{t("admin.competitions.qrisHint")}</FieldDescription>
        <FieldError errors={error ? [{ message: t(error, errorParams) }] : undefined} />
        {uploading && <Progress value={progress} />}
        <Button type="button" onClick={handleUpload} disabled={!file || busy} className="sm:w-fit">
          {busy ? <Spinner /> : <UploadIcon />}
          {uploading ? t("payment.uploading", { progress }) : qrisUrl ? t("admin.competitions.qrisReplace") : t("admin.competitions.qrisUpload")}
        </Button>
      </Field>
    </div>
  );
}
