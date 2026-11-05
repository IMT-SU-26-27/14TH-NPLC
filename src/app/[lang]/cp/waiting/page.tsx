import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestWaiting } from "@/features/cp/components/cp-sections";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("cp.waiting.title"), description: t("cp.title"), robots: { index: false } };
}

export default async function Page({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("cp.waiting.title")}</h1>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <ContestWaiting lang={lang} />
      </Suspense>
    </main>
  );
}
