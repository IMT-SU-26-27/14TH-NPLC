import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSubmissionsSection } from "@/features/cp/components/admin-submissions";
import type { AdminSubmissionsPageProps } from "@/types/cp";

export async function generateMetadata({ params }: AdminSubmissionsPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.submissions.title"), description: t("admin.submissions.lead") };
}

export default async function AdminSubmissionsPage({ params, searchParams }: AdminSubmissionsPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("admin.submissions.title")}</h1>
        <p className="text-muted-foreground">{t("admin.submissions.lead")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <AdminSubmissionsSection lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
