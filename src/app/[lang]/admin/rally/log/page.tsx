import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RallyLogSection } from "@/features/rally/components/rally-log-section";
import type { RallyListPageProps } from "@/types/rally";

export async function generateMetadata({ params }: RallyListPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("rally.log.title"), description: t("rally.log.lead") };
}

export default async function AdminRallyLogPage({ params, searchParams }: RallyListPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <div className="space-y-6">
      <Link href={localePath(lang, "/admin/rally")} className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2" })}>
        <ArrowLeftIcon />
        {t("rally.admin.title")}
      </Link>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("rally.log.title")}</h1>
        <p className="text-muted-foreground">{t("rally.log.lead")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <RallyLogSection lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
