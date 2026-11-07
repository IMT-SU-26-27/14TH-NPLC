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
    <main className="flex-1">
      <Suspense fallback={<Skeleton className="mx-auto my-12 h-128 max-w-6xl" />}>
        <RegisterSection params={params} />
      </Suspense>
    </main>
  );
}

