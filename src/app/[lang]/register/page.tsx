import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBand } from "@/components/shared/page-band";
import { RegisterIndexSection } from "@/features/registration/components/register-index-section";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("register.pageTitle"), description: t("meta.registerDescription") };
}

export default async function RegisterIndexPage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="flex-1">
      <PageBand index="08" label={t("register.label")} title={t("register.pageTitle")} lead={t("register.pageLead")} mascot={{ src: "/auth/maskot-1.webp" }}>
        <p className="text-band-muted text-sm">
          {t("register.joinExisting")}{" "}
          <Link
            href={localePath(lang, "/join")}
            className="text-highlight focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3"
          >
            {t("register.joinExistingLink")}
            <ArrowRightIcon aria-hidden className="size-3.5" />
          </Link>
        </p>
      </PageBand>
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <RegisterIndexSection lang={lang} />
        </Suspense>
      </div>
    </main>
  );
}
