import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AboutHero } from "@/features/landing/components/about-hero";
import { TimelineSection } from "@/features/landing/components/timeline-section";
import { CompetitionList } from "@/features/competitions/components/competition-list";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: { absolute: t("meta.homeTitle") }, description: t("meta.homeDescription") };
}

export default async function HomePage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="flex-1">
      <Suspense fallback={<Skeleton className="mx-auto mt-24 h-72 max-w-3xl" />}>
        <AboutHero lang={lang} />
      </Suspense>

      <section id="timeline" className="mx-auto max-w-6xl scroll-mt-20 space-y-6 px-4 pb-20">
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">{t("landing.timelineTitle")}</h2>
          <p className="text-muted-foreground">{t("landing.timelineLead")}</p>
        </div>
        <Suspense fallback={<Skeleton className="h-64" />}>
          <TimelineSection lang={lang} />
        </Suspense>
      </section>

      <section id="competitions" className="mx-auto max-w-6xl scroll-mt-20 space-y-6 px-4 pb-24">
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">{t("landing.competitionsTitle")}</h2>
          <p className="text-muted-foreground">{t("landing.competitionsLead")}</p>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          }
        >
          <CompetitionList lang={lang} />
        </Suspense>
      </section>
    </main>
  );
}
