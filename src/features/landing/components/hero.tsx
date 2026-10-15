"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { useHeroAnimation } from "@/hooks/use-hero-animation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  const scope = useHeroAnimation<HTMLElement>();

  return (
    <section ref={scope} className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pt-24 pb-16 text-center">
      <Badge data-hero-item variant="secondary">
        Registration is open
      </Badge>
      <h1 data-hero-item className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        14th National Programming &amp; Logic Competition
      </h1>
      <p data-hero-item className="text-muted-foreground max-w-xl text-lg text-pretty">
        Form a team, register for a competition, and compete live. Competitive programming runs online with real-time
        judging and a live leaderboard.
      </p>
      <div data-hero-item className="flex flex-wrap justify-center gap-3">
        <Link href="#competitions" className={buttonVariants({ size: "lg" })}>
          See competitions
          <ArrowRightIcon />
        </Link>
        <Link href="/join" className={buttonVariants({ size: "lg", variant: "outline" })}>
          Join a team with a code
        </Link>
      </div>
    </section>
  );
}
