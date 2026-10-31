"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CameraOffIcon, OctagonXIcon, RotateCcwIcon, SearchIcon } from "lucide-react";
import { useEffectsActive } from "@/hooks/use-effects-active";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { LoScanStepProps } from "@/types/rally";

const QrScanner = dynamic(() => import("@/features/rally/components/qr-scanner").then((m) => m.QrScanner), {
  ssr: false,
  loading: () => <Skeleton className="aspect-square w-full" />,
});

export function LoScanStep({ busy, error, onCode }: LoScanStepProps) {
  const { t } = useI18n();
  const active = useEffectsActive();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [code, setCode] = useState("");

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <OctagonXIcon />
          <AlertTitle>{t(error)}</AlertTitle>
        </Alert>
      )}

      <div className="bg-muted relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl border" aria-live="polite">
        {busy ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <Spinner className="size-8" />
            <p className="font-heading text-lg font-semibold">{t("rally.lo.reading")}</p>
          </div>
        ) : cameraError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <CameraOffIcon className="text-muted-foreground size-8" />
            <p className="font-medium">{t("rally.lo.cameraError")}</p>
            <p className="text-muted-foreground text-sm break-words">{cameraError}</p>
            <Button variant="outline" onClick={() => setCameraError(null)}>
              <RotateCcwIcon />
              {t("rally.lo.retryCamera")}
            </Button>
          </div>
        ) : active ? (
          <QrScanner onDetect={onCode} onError={setCameraError} />
        ) : null}
      </div>
      <p className="text-muted-foreground text-center text-sm">{t("rally.lo.scanHint")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) onCode(code);
        }}
      >
        <Field>
          <FieldLabel htmlFor="teamCode">{t("rally.lo.manualLabel")}</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="teamCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="font-mono tracking-widest uppercase"
            />
            <Button type="submit" variant="outline" disabled={busy || !code.trim()}>
              <SearchIcon />
              {t("rally.lo.find")}
            </Button>
          </div>
          <FieldDescription>{t("rally.lo.manualHint")}</FieldDescription>
        </Field>
      </form>
    </div>
  );
}
