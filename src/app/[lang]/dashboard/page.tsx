import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBand } from "@/components/shared/page-band";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import type { DashboardPageProps } from "@/types/registration";

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("dashboard.title"), description: t("meta.dashboardDescription") };
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="flex-1">
      <PageBand index="07" label={t("dashboard.title")} title={t("dashboard.title")} lead={t("dashboard.lead")} mascot={{ src: "/shared/maskot-4.webp" }} />
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-12 sm:pt-12 sm:pb-16">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
              <Skeleton className="h-96 rounded-[12px]" />
              <Skeleton className="h-60 rounded-[12px]" />
            </div>
          }
        >
          <DashboardContent lang={lang} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
