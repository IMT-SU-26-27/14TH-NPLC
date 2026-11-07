"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { useHeroAnimation } from "@/hooks/use-hero-animation";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { HeroProps } from "@/types/landing";

// Decorative binary rows from the Figma hero ("NPLCXIV" and "DECODE" in ASCII).
const BINARY_TOP = "01001110 01010000 01001100 01000011 01011000 01001001 01010110 ".repeat(3);
const BINARY_BOTTOM = "01000100 01000101 01000011 01001111 01000100 01000101 ".repeat(3);
const CODE_LINE = "if (unknown) { decode(); } // analyze · think · solve // ".repeat(2);
const SLASH_COLORS = ["text-primary", "text-highlight", "text-brand-purple"];

export function Hero({ status }: HeroProps) {
  const scope = useHeroAnimation<HTMLElement>();
  const { t, href } = useI18n();
  const motto = [t("landing.hero.analyze"), t("landing.hero.think"), t("landing.hero.solve")];

  return (
    <section ref={scope} className="relative isolate overflow-hidden">
      <Image
        src="/shared/bg-wave-halftone.webp"
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover object-bottom opacity-50"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-(image:--hero-fade-v) lg:bg-(image:--hero-fade)" />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 pb-28 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pt-14 lg:pb-36">
        <div className="space-y-6">
          <p data-hero-item className="text-primary flex max-w-xs items-start gap-2 font-mono text-xs tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-primary mt-1 size-2 shrink-0 rounded-xs" />
            {t("landing.hero.eyebrow")}
          </p>

          <h1 data-hero-item className="text-5xl leading-[0.95] font-bold tracking-tight uppercase sm:text-7xl">
            {t("landing.hero.title")}
          </h1>

          <div data-hero-item className="flex flex-wrap items-end gap-x-6 gap-y-3">
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
            <p className="bg-(image:--tagline-gradient) bg-clip-text text-xl leading-tight font-semibold text-transparent italic sm:text-2xl">
              {t("landing.hero.taglineTop")}
              <br />
              {t("landing.hero.taglineBottom")}
            </p>
          </div>

          <p data-hero-item className="text-muted-foreground max-w-lg text-base text-pretty sm:text-lg">
            {t("landing.hero.lead")}
          </p>

          <div data-hero-item className="flex flex-wrap gap-3">
            <Link
              href={href("/register")}
              className={cn(buttonVariants({ size: "lg" }), "bg-highlight text-highlight-foreground hover:bg-highlight/80 h-11 px-5")}
            >
              {t("landing.hero.register")}
              <ArrowRightIcon />
            </Link>
            <Link
              href="#competitions"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-primary h-11 bg-transparent px-5")}
            >
              {t("landing.hero.seeCompetitions")}
            </Link>
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

        <div aria-hidden className="relative hidden min-h-80 sm:block lg:min-h-105">
          <p className="text-muted-foreground absolute top-0 right-0 max-w-28 text-right font-mono text-xs tracking-[0.2em] uppercase">
            {t("landing.hero.host")}
          </p>
          <div className="text-primary/25 absolute inset-x-0 top-1/3 space-y-3 overflow-hidden font-mono text-xs whitespace-nowrap">
            <p>{BINARY_TOP}</p>
            <p>{CODE_LINE}</p>
            <p>{BINARY_BOTTOM}</p>
          </div>
          <Image
            src="/landing/sparkle-silver-cluster.webp"
            alt=""
            width={587}
            height={577}
            sizes="(min-width: 1024px) 420px, 320px"
            className="relative mx-auto mt-10 w-72 drop-shadow-xl lg:w-96"
          />
        </div>
      </div>
    </section>
  );
}
