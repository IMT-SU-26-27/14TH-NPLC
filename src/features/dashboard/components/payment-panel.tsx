"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { InfoIcon, OctagonXIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { getPaymentUploadSignature, submitPayment } from "@/lib/actions/registration";
import { formatRupiah } from "@/lib/format";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import type { PaymentPanelProps, PaymentProofFormat } from "@/types/registration";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

export function PaymentPanel({ team, qrisUrl }: PaymentPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, startSubmit] = useTransition();
  const { upload, uploading, progress, error } = useCloudinaryUpload({
    getSignature: () => getPaymentUploadSignature(team.id),
    maxBytes: MAX_BYTES,
    accept: ACCEPT,
  });

  const { min_members, max_members, fee } = team.competition;
  const memberCount = team.members.length;
  const teamReady = memberCount >= min_members && memberCount <= max_members;
  const busy = uploading || submitting;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    const uploaded = await upload(file);
    if (!uploaded) return;
    startSubmit(async () => {
      const result = await submitPayment({
        registrationId: team.id,
        publicId: uploaded.publicId,
        format: uploaded.format as PaymentProofFormat,
      });
      if (result.ok) toast.success(result.message ?? "Payment submitted");
      else toast.error(result.message);
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,14rem)_1fr]">
      <div className="space-y-2">
        {qrisUrl ? (
          <Image
            src={qrisUrl}
            alt={`QRIS code to pay for ${team.competition.name}`}
            width={448}
            height={448}
            className="bg-card w-full rounded-lg border"
          />
        ) : (
          <Alert>
            <InfoIcon />
            <AlertDescription>The QRIS code hasn&apos;t been uploaded yet. Check back soon.</AlertDescription>
          </Alert>
        )}
        <p className="text-sm">
          Amount: <span className="font-semibold">{formatRupiah(fee)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {!teamReady && (
            <Alert>
              <InfoIcon />
              <AlertTitle>Team not complete yet</AlertTitle>
              <AlertDescription>
                You need {min_members}–{max_members} members before submitting. You have {memberCount}.
              </AlertDescription>
            </Alert>
          )}
          {team.status === "rejected" && (
            <Alert variant="destructive">
              <OctagonXIcon />
              <AlertTitle>Fix the issue and submit again</AlertTitle>
              <AlertDescription>{team.rejection_reason}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={`proof-${team.id}`}>Payment proof</FieldLabel>
            <Input
              id={`proof-${team.id}`}
              type="file"
              accept={ACCEPT.join(",")}
              disabled={busy}
              aria-invalid={!!error}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <FieldDescription>Screenshot or PDF of the QRIS payment, up to 5 MB.</FieldDescription>
            <FieldError errors={error ? [{ message: error }] : undefined} />
          </Field>
          {uploading && <Progress value={progress} />}
          <Button type="submit" disabled={!file || !teamReady || busy}>
            {busy ? <Spinner /> : <UploadIcon />}
            {uploading ? `Uploading ${progress}%` : submitting ? "Submitting…" : "Submit payment"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
