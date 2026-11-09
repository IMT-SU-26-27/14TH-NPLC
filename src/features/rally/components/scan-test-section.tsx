import { requireAdmin } from "@/lib/data/auth";
import { getT } from "@/lib/i18n/get-dictionary";
import { qrSvg } from "@/lib/rally/qr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanTestPanel } from "@/features/rally/components/scan-test-panel";
import type { LangProps } from "@/types/i18n";

// A sample code only; it does not belong to any team.
const SAMPLE = "nplc-rally:00000000-0000-4000-8000-000000000000";

export async function ScanTestSection({ lang }: LangProps) {
  const t = getT(lang);
  await requireAdmin();
  const svg = await qrSvg(SAMPLE);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ScanTestPanel expected={SAMPLE} />
      <Card>
        <CardHeader>
          <CardTitle>{t("rally.scanTest.sampleTitle")}</CardTitle>
          <CardDescription>{t("rally.scanTest.sampleLead")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Generated on the server from a constant, not from user input. */}
          <div
            role="img"
            aria-label={t("rally.scanTest.sampleTitle")}
            className="mx-auto w-full max-w-sm rounded-lg border bg-white"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
