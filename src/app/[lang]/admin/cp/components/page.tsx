import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestComponentsPreview } from "@/features/cp/components/contest-components-preview";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.cpComponents.title"), description: t("admin.cpComponents.lead"), robots: { index: false } };
}

// Not linked from the admin menu: a reference page for the people building the contest screens.
export default async function AdminCpComponentsPage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("admin.cpComponents.title")}</h1>
        <p className="text-muted-foreground max-w-3xl">{t("admin.cpComponents.lead")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[48rem]" />}>
        <ContestComponentsPreview lang={lang} />
      </Suspense>
    </div>
  );
}
