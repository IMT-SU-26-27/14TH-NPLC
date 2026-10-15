import { Suspense } from "react";
import type { Metadata } from "next";
import { getActiveCompetitionBySlug } from "@/lib/data/competitions";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterSection } from "@/features/registration/components/register-section";
import type { RegisterPageProps } from "@/types/registration";

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  const competition = await getActiveCompetitionBySlug((await params).slug);
  return {
    title: competition ? t("register.title", { competition: competition.name }) : t("register.pageTitle"),
    description: t("meta.registerSlugDescription"),
  };
}

export default function RegisterPage({ params }: RegisterPageProps) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <RegisterSection params={params} />
      </Suspense>
    </main>
  );
}

