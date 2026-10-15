import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RegistrationsSection } from "@/features/admin/components/registrations-section";
import type { AdminRegistrationsPageProps } from "@/types/admin";

export async function generateMetadata({ params }: AdminRegistrationsPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.registrations.title"), description: t("meta.adminRegistrationsDescription") };
}

export default async function AdminRegistrationsPage({ params, searchParams }: AdminRegistrationsPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("admin.registrations.title")}</h1>
          <p className="text-muted-foreground">{t("admin.registrations.lead")}</p>
        </div>
        <Link href={localePath(lang, "/admin/registrations/new")} className={buttonVariants()}>
          <PlusIcon />
          {t("admin.registrations.new")}
        </Link>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <RegistrationsSection lang={lang} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
