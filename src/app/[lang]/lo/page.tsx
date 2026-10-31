import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { LoPostsSection } from "@/features/rally/components/lo-posts-section";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("rally.lo.title"), description: t("rally.lo.lead"), robots: { index: false } };
}

export default async function LoPage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("rally.lo.title")}</h1>
        <p className="text-muted-foreground">{t("rally.lo.lead")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-48" />}>
        <LoPostsSection lang={lang} />
      </Suspense>
    </main>
  );
}
