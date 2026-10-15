import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitionsSection } from "@/features/admin/components/competitions-section";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.competitions.title"), description: t("admin.competitions.lead") };
}

export default async function AdminCompetitionsPage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("admin.competitions.title")}</h1>
          <p className="text-muted-foreground">{t("admin.competitions.lead")}</p>
        </div>
        <Link href={localePath(lang, "/admin/competitions/new")} className={buttonVariants()}>
          <PlusIcon />
          {t("admin.competitions.new")}
        </Link>
      </div>
      <Suspense fallback={<Skeleton className="h-64" />}>
        <CompetitionsSection lang={lang} />
      </Suspense>
    </div>
  );
}
