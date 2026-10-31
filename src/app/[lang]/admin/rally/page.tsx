import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { HistoryIcon, ListChecksIcon, PlusIcon, ScanLineIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RallyAdminSection } from "@/features/rally/components/rally-admin-section";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("rally.admin.title"), description: t("rally.admin.lead") };
}

export default async function AdminRallyPage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("rally.admin.title")}</h1>
          <p className="text-muted-foreground">{t("rally.admin.lead")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={localePath(lang, "/admin/rally/results")} className={buttonVariants({ variant: "outline" })}>
            <ListChecksIcon />
            {t("rally.results.title")}
          </Link>
          <Link href={localePath(lang, "/admin/rally/log")} className={buttonVariants({ variant: "outline" })}>
            <HistoryIcon />
            {t("rally.log.title")}
          </Link>
          <Link href={localePath(lang, "/admin/rally/scan-test")} className={buttonVariants({ variant: "outline" })}>
            <ScanLineIcon />
            {t("rally.scanTest.title")}
          </Link>
          <Link href={localePath(lang, "/admin/rally/posts/new")} className={buttonVariants()}>
            <PlusIcon />
            {t("rally.admin.newPost")}
          </Link>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <RallyAdminSection lang={lang} />
      </Suspense>
    </div>
  );
}
