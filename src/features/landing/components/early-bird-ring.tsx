"use client";

import { useDaysLeft } from "@/hooks/use-days-left";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import type { EarlyBirdRingProps } from "@/types/landing";

const SEGMENTS = 40;
const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DASH = CIRCUMFERENCE / SEGMENTS;

// Segmented countdown ring: one lit segment per remaining share of the early bird period.
export function EarlyBirdRing({ totalDays, endsAt }: EarlyBirdRingProps) {
  const { t } = useI18n();
  const days = useDaysLeft(endsAt);
  const lit = days === null ? SEGMENTS : Math.round((Math.min(days, totalDays) / totalDays) * SEGMENTS);

  return (
    <div className="relative mx-auto size-44 shrink-0 sm:size-52">
      <svg viewBox="0 0 200 200" aria-hidden className="size-full -rotate-90">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            strokeWidth="14"
            strokeDasharray={`${DASH * 0.62} ${CIRCUMFERENCE - DASH * 0.62}`}
            strokeDashoffset={-DASH * i}
            className={cn(i < lit ? (i < SEGMENTS / 2 ? "stroke-primary" : "stroke-brand-purple") : "stroke-primary/15")}
          />
        ))}
        <circle cx="100" cy="100" r="66" fill="none" strokeWidth="1" strokeDasharray="2 4" className="stroke-border" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-primary font-mono text-[0.6rem] tracking-[0.2em] uppercase">{t("landing.fees.earlyBird")}</p>
        <p className="font-heading text-5xl leading-none font-bold tabular-nums">{days ?? "–"}</p>
        <p className="text-muted-foreground font-mono text-[0.6rem] tracking-[0.2em] uppercase">
          {days === 1 ? t("landing.fees.lastDay") : t("landing.fees.daysLeft")}
        </p>
      </div>
    </div>
  );
}
