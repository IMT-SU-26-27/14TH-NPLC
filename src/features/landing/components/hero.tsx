"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { HeroCube } from "@/features/landing/components/hero-cube";
import { HeroCubeFragments } from "@/features/landing/components/hero-cube-fragments";
import { useHeroAnimation } from "@/hooks/use-hero-animation";
import { useI18n } from "@/hooks/use-i18n";
import { sectionHref } from "@/lib/home-sections";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SectionLink } from "@/components/shared/section-link";
import type { HeroProps } from "@/types/landing";

// Decorative binary rows behind the cube ("NPLCXIV" and "DECODE" in ASCII).
const BINARY_TOP = "01001110 01010000 01001100 01000011 01011000 01001001 01010110 ".repeat(3);
const BINARY_BOTTOM = "01000100 01000101 01000011 01001111 01000100 01000101 ".repeat(3);
const CODE_LINE = "if (unknown) { decode(); } // analyze · think · solve // ".repeat(2);
const SLASH_COLORS = ["text-primary", "text-highlight", "text-brand-purple"];

export function Hero({ status }: HeroProps) {
  const scope = useHeroAnimation<HTMLElement>();
  const { t, href, lang } = useI18n();
  const motto = [t("landing.hero.analyze"), t("landing.hero.think"), t("landing.hero.solve")];

  return (
    <section ref={scope} className="relative isolate overflow-hidden">
      {/* Static wave along the bottom, as in the design (45% opacity). */}
      <Image
        src="/landing/hero-wave.webp"
        alt=""
        width={2000}
        height={575}
        sizes="100vw"
        className="pointer-events-none absolute inset-x-0 bottom-8 -z-10 h-[170px] w-full object-cover opacity-45 sm:bottom-10 sm:h-60"
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:pt-12 lg:pb-32">
        <div data-hero-item className="text-primary flex items-start justify-between gap-4 font-mono text-xs tracking-[0.2em] uppercase">
          <p className="flex items-start gap-2">
            <span aria-hidden className="bg-primary mt-1 size-2 shrink-0 rounded-xs" />
            <span className="sm:hidden">{t("landing.hero.eyebrowShort")}</span>
            <span className="max-sm:hidden">{t("landing.hero.eyebrow")}</span>
          </p>
          <p className="text-muted-foreground max-sm:hidden">{t("landing.hero.host")}</p>
        </div>

        <div className="mt-4 grid items-center gap-6 lg:mt-0 lg:grid-cols-[minmax(0,45rem)_minmax(0,33.75rem)] lg:justify-between lg:gap-5">
          <div className="space-y-6">
            <h1 data-hero-item className="pt-2 lg:pt-8">
              <Image
                src="/landing/hero-title-mobile.webp"
                alt={t("landing.hero.title")}
                width={358}
                height={75}
                preload
                sizes="(min-width: 640px) 0px, 358px"
                className="h-auto w-full max-w-[358px] sm:hidden"
              />
              <Image
                src="/landing/hero-title-desktop.webp"
                alt={t("landing.hero.title")}
                width={755}
                height={170}
                preload
                sizes="(min-width: 1024px) 720px, (min-width: 640px) 90vw, 0px"
                className="h-auto w-full max-w-[755px] max-sm:hidden"
              />
            </h1>

            <div data-hero-item className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-7">
              <p className="font-mono text-sm tracking-[0.3em] uppercase">
                {motto.map((word, i) => (
                  <span key={word}>
                    {word}
                    <span aria-hidden className={`mx-2 ${SLASH_COLORS[i]}`}>
                      /
                    </span>
                  </span>
                ))}
              </p>
              <Image
                src="/landing/tagline-same-logic.webp"
                alt={`${t("landing.hero.taglineTop")} ${t("landing.hero.taglineBottom")}`}
                width={445}
                height={143}
                sizes="(min-width: 640px) 222px, 150px"
                className="h-auto w-[150px] self-end sm:w-[222px] sm:self-auto"
              />
            </div>

            <p data-hero-item className="text-muted-foreground max-w-[35rem] text-base text-pretty sm:text-lg">
              {t("landing.hero.lead")}
            </p>

            <div data-hero-item className="flex flex-wrap gap-3">
              <Link
                href={href("/register")}
                className={cn(buttonVariants({ size: "lg" }), "bg-highlight text-highlight-foreground hover:bg-highlight/80 h-12 px-5")}
              >
                {t("landing.hero.register")}
                <ArrowRightIcon />
              </Link>
              <SectionLink
                href={sectionHref(lang, "competitions")}
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-primary h-12 bg-transparent px-5")}
              >
                {t("landing.hero.seeCompetitions")}
              </SectionLink>
            </div>

            {status.open && (
              <p data-hero-item className="text-muted-foreground flex items-start gap-2 font-mono text-xs tracking-[0.15em] uppercase">
                <span aria-hidden className="bg-highlight ring-highlight-foreground/30 mt-0.5 size-2.5 shrink-0 rounded-full ring-1" />
                <span>
                  {t("landing.hero.statusOpen")}
                  {status.earlyBirdDate && ` · ${t("landing.hero.earlyBirdUntil", { date: status.earlyBirdDate })}`}
                </span>
              </p>
            )}
          </div>

          {/* The cube, its orbit ring and the two fragments, each animated on its own (see useHeroAnimation). */}
          <div aria-hidden className="relative order-first mx-auto w-full max-w-[300px] sm:max-w-[420px] lg:order-none lg:max-w-[540px]">
            <div className="text-foreground pointer-events-none absolute -inset-x-[12%] top-[31.8%] z-0 flex flex-col gap-[18px] overflow-hidden font-mono text-[11px] leading-4 tracking-[0.32em] whitespace-nowrap opacity-6 sm:-right-[11.1%] sm:-left-[14.8%] sm:top-[28.85%] sm:gap-[22px] sm:text-[13px]">
              <p>{BINARY_TOP}</p>
              <p>{CODE_LINE}</p>
              <p>{BINARY_BOTTOM}</p>
            </div>
            <div className="bg-brand-purple/20 absolute inset-[22%] rounded-full blur-3xl" />
            <div
              data-hero-art
              className="relative aspect-[540/520] motion-safe:animate-[hero-art-failsafe_0s_linear_3s_forwards] motion-safe:[&:not([data-hero-ready])]:invisible"
            >
              {/* With motion, hidden until the hero script marks it ready (every layer at its start), so nothing shows
                  twice. If the script fails or is over 3 s late, the CSS failsafe shows it as it is. */}
              <div data-hero-float className="absolute inset-0">
                <HeroCube className="size-full" />
              </div>
              <HeroCubeFragments className="absolute inset-0 size-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
