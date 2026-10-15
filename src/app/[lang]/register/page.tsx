import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitionList } from "@/features/competitions/components/competition-list";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("register.pageTitle"), description: t("meta.registerDescription") };
}

export default async function RegisterIndexPage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-12">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("register.pageTitle")}</h1>
        <p className="text-muted-foreground">{t("register.pageLead")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-72" />}>
        <CompetitionList lang={lang} />
      </Suspense>
    </main>
  );
}
