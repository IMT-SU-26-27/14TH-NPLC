import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminFocusSection } from "@/features/cp/components/admin-focus";
import type { AdminFocusPageProps } from "@/types/cp";

export async function generateMetadata({ params }: AdminFocusPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.focus.title"), description: t("admin.focus.lead") };
}

export default async function AdminFocusPage({ params, searchParams }: AdminFocusPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("admin.focus.title")}</h1>
        <p className="text-muted-foreground max-w-3xl">{t("admin.focus.lead")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <AdminFocusSection lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
