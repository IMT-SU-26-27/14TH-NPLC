import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBand } from "@/components/shared/page-band";
import { RegisterIndexSection } from "@/features/registration/components/register-index-section";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("register.pageTitle"), description: t("meta.registerDescription") };
}

export default async function RegisterIndexPage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="flex-1">
      <PageBand index="08" label={t("register.label")} title={t("register.pageTitle")} lead={t("register.pageLead")} />
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <RegisterIndexSection lang={lang} />
        </Suspense>
      </div>
    </main>
  );
}
