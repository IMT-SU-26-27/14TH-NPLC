import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RallyResultsSection } from "@/features/rally/components/rally-results-section";
import type { RallyListPageProps } from "@/types/rally";

export async function generateMetadata({ params }: RallyListPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("rally.results.title"), description: t("rally.results.lead") };
}

export default async function AdminRallyResultsPage({ params, searchParams }: RallyListPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <div className="space-y-6">
      <Link href={localePath(lang, "/admin/rally")} className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2" })}>
        <ArrowLeftIcon />
        {t("rally.admin.title")}
      </Link>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("rally.results.title")}</h1>
        <p className="text-muted-foreground">{t("rally.results.lead")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <RallyResultsSection lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
