import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { sectionId } from "@/lib/home-sections";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AboutHero } from "@/features/landing/components/about-hero";
import { AboutSection } from "@/features/landing/components/about-section";
import { CompetitionSection } from "@/features/landing/components/competition-section";
import { ContactSection } from "@/features/landing/components/contact-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { FeeSection } from "@/features/landing/components/fee-section";
import { HomeHashScroll } from "@/features/landing/components/home-hash-scroll";
import { SectionHeading } from "@/features/landing/components/section-heading";
import { StepsSection } from "@/features/landing/components/steps-section";
import { TimelineSection } from "@/features/landing/components/timeline-section";
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
      <Suspense fallback={<Skeleton className="mx-auto mt-16 h-96 max-w-6xl" />}>
        <AboutHero lang={lang} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-150 rounded-none" />}>
        <AboutSection lang={lang} />
      </Suspense>

      <section id={sectionId(lang, "competitions")} className="bg-secondary scroll-mt-14 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl space-y-10 px-4">
          <SectionHeading
            index="02"
            label={t("landing.competitions.label")}
            title={t("landing.competitions.title")}
            lead={t("landing.competitions.lead")}
          />
          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-36" />
                  <Skeleton className="h-36" />
                </div>
                <Skeleton className="h-48" />
              </div>
            }
          >
            <CompetitionSection lang={lang} />
          </Suspense>
        </div>
      </section>

      <StepsSection lang={lang} />

      <Suspense fallback={<Skeleton className="h-120 rounded-none" />}>
        <TimelineSection lang={lang} />
      </Suspense>

      <Suspense fallback={<Skeleton className="mx-auto my-20 h-72 max-w-6xl" />}>
        <FeeSection lang={lang} />
      </Suspense>

      <FaqSection lang={lang} />
      <ContactSection lang={lang} />
      <HomeHashScroll />
    </main>
  );
}
