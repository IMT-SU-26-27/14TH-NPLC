import { cacheLife, cacheTag } from "next/cache";
import { CalendarIcon } from "lucide-react";
import { CONTENT_TAG, getTimelineEvents } from "@/lib/data/content";
import { formatDateRange } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { GridBackdrop } from "@/features/landing/components/grid-backdrop";
import { SectionHeading } from "@/features/landing/components/section-heading";
import type { TimelineSectionProps } from "@/types/content";

// Today's date in WIB as "YYYY-MM-DD", comparable with the date-only timeline columns.
function todayInWib(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// "04 // Timeline": the admin's timeline events (Admin > Content), the running phase highlighted.
export async function TimelineSection({ lang }: TimelineSectionProps) {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  const t = getT(lang);
  const events = await getTimelineEvents();
  const today = todayInWib();

  return (
    <section
      id="timeline"
      className="bg-band relative isolate scroll-mt-14 py-24 [clip-path:polygon(0_3rem,100%_0,100%_calc(100%_-_3rem),0_100%)] sm:py-32"
    >
      <GridBackdrop />
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <SectionHeading
          index="04"
          label={t("landing.timeline.label")}
          title={t("landing.timelineTitle")}
          lead={t("landing.timelineLead")}
          tone="dark"
        />

        {events.length === 0 ? (
          <Empty className="border-background/15 text-band-foreground border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarIcon />
              </EmptyMedia>
              <EmptyTitle>{t("landing.timelineEmpty")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ol className="grid gap-8 md:grid-flow-col md:auto-cols-fr md:gap-4">
            {events.map((event, i) => {
              const n = String(i + 1).padStart(2, "0");
              const active = event.starts_on <= today && today <= (event.ends_on ?? event.starts_on);
              const description = lang === "id" ? event.description_id : event.description_en;
              return (
                <li key={event.id} className="relative space-y-3">
                  {i < events.length - 1 && (
                    <span aria-hidden className="bg-brand-sky/40 absolute top-4 right-[-1rem] left-9 hidden h-px md:block" />
                  )}
                  <span
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-full border font-mono text-xs",
                      active ? "bg-highlight text-highlight-foreground border-highlight" : "border-brand-sky text-brand-sky",
                    )}
                  >
                    {n}
                  </span>
                  <p className="text-brand-sky font-mono text-xs tracking-[0.2em] uppercase">{t("landing.timeline.phase", { n })}</p>
                  <Card
                    className={cn(
                      "bg-background/5 text-band-foreground rounded-[12px]",
                      active ? "ring-highlight shadow-[0_0_24px_color-mix(in_oklch,var(--highlight)_45%,transparent)] ring-2" : "ring-brand-sky/30",
                    )}
                  >
                    <CardHeader className="gap-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-brand-sky font-mono text-xs tracking-wider">{formatDateRange(event.starts_on, event.ends_on, lang)}</p>
                        {active && (
                          <Badge variant="outline" className="border-background/30 text-band-foreground font-mono text-xs tracking-[0.15em] uppercase">
                            <span aria-hidden className="bg-highlight size-1.5 rounded-full" />
                            {t("landing.timeline.active")}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-band-foreground text-lg font-bold">{lang === "id" ? event.title_id : event.title_en}</CardTitle>
                      {description && <CardDescription className="text-band-muted">{description}</CardDescription>}
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
