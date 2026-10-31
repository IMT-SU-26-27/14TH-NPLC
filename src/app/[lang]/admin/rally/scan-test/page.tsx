import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { ScanTestSection } from "@/features/rally/components/scan-test-section";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("rally.scanTest.title"), description: t("rally.scanTest.lead") };
}

export default async function ScanTestPage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("rally.scanTest.title")}</h1>
        <p className="text-muted-foreground">{t("rally.scanTest.lead")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <ScanTestSection lang={lang} />
      </Suspense>
    </div>
  );
}
