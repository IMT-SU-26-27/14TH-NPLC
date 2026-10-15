"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { useHeroAnimation } from "@/hooks/use-hero-animation";
import { useI18n } from "@/hooks/use-i18n";
import { buttonVariants } from "@/components/ui/button";
import type { HeroProps } from "@/types/content";

// About NPLC: the first thing on the homepage. Text comes from the admin's homepage content.
export function Hero({ title, paragraphs }: HeroProps) {
  const scope = useHeroAnimation<HTMLElement>();
  const { t, href } = useI18n();

  return (
    <section ref={scope} className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pt-24 pb-16 text-center">
      <h1 data-hero-item className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        {title}
      </h1>
      <div data-hero-item className="text-muted-foreground max-w-2xl space-y-4 text-lg text-pretty">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div data-hero-item className="flex flex-wrap justify-center gap-3">
        <Link href="#competitions" className={buttonVariants({ size: "lg" })}>
          {t("landing.seeCompetitions")}
          <ArrowRightIcon />
        </Link>
        <Link href={href("/join")} className={buttonVariants({ size: "lg", variant: "outline" })}>
          {t("landing.joinWithCode")}
        </Link>
      </div>
    </section>
  );
}
