import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, BoxIcon, CodeXmlIcon, NetworkIcon, SparkleIcon, UserPlusIcon } from "lucide-react";
import { CONTENT_TAG, getSiteContent } from "@/lib/data/content";
import { GUIDEBOOK_URL } from "@/lib/event-info";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GridBackdrop } from "@/features/landing/components/grid-backdrop";
import { SectionHeading } from "@/features/landing/components/section-heading";
import type { LangProps } from "@/types/i18n";

const darkCard = "bg-background/5 text-band-foreground ring-background/15 relative rounded-[12px]";

// "01 // Tentang": the admin's About text (Admin > Content) with the built-in summary as fallback.
export async function AboutSection({ lang }: LangProps) {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  const t = getT(lang);
  const content = await getSiteContent();
  const body = (lang === "id" ? content?.about_body_id : content?.about_body_en) || t("landing.about.body");
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const facts = [
    { icon: CodeXmlIcon, tint: "bg-primary text-primary-foreground", label: t("landing.about.levelLabel"), value: t("landing.about.level") },
    { icon: BoxIcon, tint: "bg-brand-purple text-foreground", label: t("landing.about.participantsLabel"), value: t("landing.about.participants") },
    { icon: NetworkIcon, tint: "bg-highlight text-highlight-foreground", label: t("landing.about.hostLabel"), value: t("landing.about.host") },
    { icon: SparkleIcon, tint: "bg-brand-sky text-foreground", label: t("landing.about.themeLabel"), value: t("landing.about.theme") },
  ];

  return (
    <section
      id="about"
      className="bg-band relative isolate scroll-mt-14 py-24 [clip-path:polygon(0_3rem,100%_0,100%_calc(100%_-_3rem),0_100%)] sm:py-32"
    >
      <GridBackdrop />
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <SectionHeading index="01" label={t("landing.about.label")} title={t("landing.about.title")} tone="dark" />

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card className={cn(darkCard, "gap-8 py-6")}>
            <CardContent className="space-y-4 px-6">
              <p className="text-brand-sky font-mono text-xs tracking-[0.2em] uppercase">{`// ${t("landing.about.summary")}`}</p>
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-band-foreground/90 text-base leading-relaxed text-pretty sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </CardContent>
            <CardContent className="mt-auto grid gap-x-6 px-6 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="border-background/15 flex items-center gap-3 border-t py-4">
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", fact.tint)}>
                    <fact.icon aria-hidden className="size-4" />
                  </span>
                  <div>
                    <p className="text-brand-sky font-mono text-xs tracking-[0.2em] uppercase">{fact.label}</p>
                    <p className="text-band-foreground text-sm font-medium">{fact.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className={darkCard}>
              <CardHeader className="px-6">
                <p className="text-brand-sky font-mono text-xs tracking-[0.2em] uppercase">{`A // ${t("landing.about.guidebookLabel")}`}</p>
                <CardTitle className="text-band-foreground text-2xl font-bold">{t("landing.about.guidebookTitle")}</CardTitle>
                <CardDescription className="text-band-muted">{t("landing.about.guidebookBody")}</CardDescription>
                <BookOpenIcon aria-hidden className="text-brand-sky absolute top-5 right-5 size-6" />
              </CardHeader>
              <CardContent className="px-6">
                {GUIDEBOOK_URL ? (
                  <a
                    href={GUIDEBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "link" }), "text-brand-sky h-auto px-0 font-mono text-xs tracking-[0.15em] uppercase")}
                  >
                    {t("landing.about.guidebookOpen")}
                    <ArrowRightIcon />
                  </a>
                ) : (
                  <p className="text-band-muted font-mono text-xs tracking-[0.15em] uppercase">{t("landing.about.guidebookSoon")}</p>
                )}
              </CardContent>
            </Card>

            <Card className={darkCard}>
              <CardHeader className="px-6">
                <p className="text-brand-sky font-mono text-xs tracking-[0.2em] uppercase">{`B // ${t("landing.about.registerLabel")}`}</p>
                <CardTitle className="text-band-foreground text-2xl font-bold">{t("landing.about.registerTitle")}</CardTitle>
                <CardDescription className="text-band-muted">{t("landing.about.registerBody")}</CardDescription>
                <UserPlusIcon aria-hidden className="text-brand-sky absolute top-5 right-5 size-6" />
              </CardHeader>
              <CardContent className="px-6">
                <Link
                  href={localePath(lang, "/register")}
                  className={cn(buttonVariants(), "bg-highlight text-highlight-foreground hover:bg-highlight/80")}
                >
                  {t("landing.about.registerCta")}
                  <ArrowRightIcon />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
