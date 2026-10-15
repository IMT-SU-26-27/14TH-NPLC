import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import type { DashboardPageProps } from "@/types/registration";

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("dashboard.title"), description: t("meta.dashboardDescription") };
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.lead")}</p>
        </div>
        <div className="flex gap-2">
          <Link href={localePath(lang, "/join")} className={buttonVariants({ variant: "outline" })}>
            {t("nav.joinTeam")}
          </Link>
          <Link href={localePath(lang, "/register")} className={buttonVariants()}>
            {t("nav.registerTeam")}
          </Link>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-96" />
          </div>
        }
      >
        <DashboardContent lang={lang} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
