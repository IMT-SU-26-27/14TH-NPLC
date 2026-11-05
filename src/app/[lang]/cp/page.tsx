import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestHome } from "@/features/cp/components/cp-sections";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("cp.title"), description: t("cp.title"), robots: { index: false } };
}

export default async function Page({ params }: LangPageProps) {
  const lang = await resolveLang(params);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <ContestHome lang={lang} />
      </Suspense>
    </main>
  );
}
