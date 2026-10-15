import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminCpSection } from "@/features/cp/components/admin-cp-sections";
import type { AdminCpPageProps } from "@/types/cp";

export async function generateMetadata({ params }: AdminCpPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.cp.title"), description: t("admin.cp.lead") };
}

export default async function AdminCpPage({ params, searchParams }: AdminCpPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("admin.cp.title")}</h1>
        <p className="text-muted-foreground">{t("admin.cp.lead")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <AdminCpSection lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
