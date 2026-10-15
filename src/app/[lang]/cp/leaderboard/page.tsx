import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestLeaderboard } from "@/features/cp/components/cp-sections";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("cp.leaderboard"), description: t("cp.title"), robots: { index: false } };
}

export default async function Page({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("cp.leaderboard")}</h1>
          <p className="text-muted-foreground">{t("cp.leaderboardLead")}</p>
        </div>
        <Link href={localePath(lang, "/cp")} className={buttonVariants({ variant: "outline" })}>
          <ArrowLeftIcon />
          {t("cp.backToProblems")}
        </Link>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <ContestLeaderboard lang={lang} />
      </Suspense>
    </main>
  );
}
