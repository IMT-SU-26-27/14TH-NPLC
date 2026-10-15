import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminOverview } from "@/features/admin/components/admin-overview";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.overview.title"), description: t("meta.adminOverviewDescription") };
}

export default async function AdminOverviewPage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("admin.overview.title")}</h1>
        <p className="text-muted-foreground">{t("admin.overview.lead")}</p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-80" />
          </div>
        }
      >
        <AdminOverview lang={lang} />
      </Suspense>
    </div>
  );
}
