"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { CameraIcon, CheckCircle2Icon, OctagonXIcon, RotateCcwIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScanTestDetection, ScanTestPanelProps } from "@/types/rally";

const QrScanner = dynamic(() => import("@/features/rally/components/qr-scanner").then((m) => m.QrScanner), {
  ssr: false,
  loading: () => <Skeleton className="aspect-square w-full" />,
});

export function ScanTestPanel({ expected }: ScanTestPanelProps) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const [detection, setDetection] = useState<ScanTestDetection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(0);

  function start() {
    setDetection(null);
    setError(null);
    startedAt.current = Date.now();
    setActive(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("rally.scanTest.cameraTitle")}</CardTitle>
        <CardDescription>{t("rally.scanTest.cameraLead")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {active && !detection && !error && (
          <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-lg border">
            <QrScanner
              onDetect={(text) => setDetection({ text, elapsedMs: Date.now() - startedAt.current })}
              onError={setError}
            />
          </div>
        )}

        {detection && (
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>{t("rally.scanTest.detected", { seconds: (detection.elapsedMs / 1000).toFixed(1) })}</AlertTitle>
            <AlertDescription>
              <span className="font-mono break-all">{detection.text}</span>
              <Badge variant={detection.text === expected ? "default" : "destructive"} className="mt-2">
                {t(detection.text === expected ? "rally.scanTest.match" : "rally.scanTest.mismatch")}
              </Badge>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertTitle>{t("rally.scanTest.cameraError")}</AlertTitle>
            <AlertDescription className="break-words">{error}</AlertDescription>
          </Alert>
        )}

        {(!active || detection || error) && (
          <Button onClick={start}>
            {active ? <RotateCcwIcon /> : <CameraIcon />}
            {t(active ? "rally.scanTest.again" : "rally.scanTest.start")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
