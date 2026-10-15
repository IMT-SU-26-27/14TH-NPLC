import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitionEditSection } from "@/features/admin/components/competition-edit-section";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.competitions.new"), description: t("admin.competitions.lead") };
}

export default function AdminNewCompetitionPage({ params }: LangPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-[40rem]" />}>
      <CompetitionEditSection params={params} />
    </Suspense>
  );
}
