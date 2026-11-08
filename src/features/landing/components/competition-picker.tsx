"use client";

import { CheckIcon, CodeXmlIcon, NetworkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitionDetail } from "@/features/landing/components/competition-detail";
import type { CompetitionPickerProps } from "@/types/landing";

const TYPE_ICON = {
  competitive_programming: { icon: CodeXmlIcon, tint: "bg-primary text-primary-foreground" },
  logic: { icon: NetworkIcon, tint: "bg-highlight text-highlight-foreground" },
} as const;

// Fades only colour, shadow and opacity, never position; off for reduced motion.
const fade = "motion-safe:duration-200 motion-safe:ease-out";

// Two selectable competition cards with the chosen one's members, fee and deadline underneath.
export function CompetitionPicker({ items, labels }: CompetitionPickerProps) {
  return (
    <Tabs defaultValue={items[0].id} className="gap-4">
      <TabsList
        variant="line"
        className="grid h-auto w-full grid-cols-1 items-stretch gap-4 p-0 group-data-horizontal/tabs:h-auto md:grid-cols-2"
      >
        {items.map((item, i) => {
          const { icon: Icon, tint } = TYPE_ICON[item.type];
          return (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className={cn(
                "group/pick text-foreground hover:border-primary/60 border-border h-auto flex-col items-stretch justify-start gap-2 rounded-[12px] p-5 text-left whitespace-normal after:hidden sm:p-6",
                "group-data-[variant=line]/tabs-list:bg-card group-data-[variant=line]/tabs-list:data-active:bg-card",
                // Selected, as in design 01: a 2px gradient ring and a soft blue glow.
                "group-data-[variant=line]/tabs-list:data-active:shadow-[0_0_24px_var(--primary)] group-data-[variant=line]/tabs-list:data-active:shadow-primary/35",
                "transition-none motion-safe:transition-[border-color,box-shadow]",
                fade,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -inset-px rounded-[12px] bg-(image:--tagline-gradient) p-0.5 opacity-0 group-data-active/pick:opacity-100",
                  "[mask:linear-gradient(var(--foreground)_0_0)_content-box_exclude,linear-gradient(var(--foreground)_0_0)]",
                  "motion-safe:transition-opacity",
                  fade,
                )}
              />
              <span className="flex items-start justify-between gap-3">
                <span className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
                  {`${String(i + 1).padStart(2, "0")} // ${item.name}`}
                </span>
                {/* Always laid out, only shown on the chosen card, so selecting never shifts the card. */}
                <Badge
                  className={cn(
                    "bg-highlight text-highlight-foreground invisible font-mono text-xs tracking-[0.15em] uppercase opacity-0 group-data-active/pick:visible group-data-active/pick:opacity-100",
                    "motion-safe:transition-[opacity,visibility]",
                    fade,
                  )}
                >
                  <CheckIcon />
                  {labels.selected}
                </Badge>
              </span>
              <span className="flex items-end justify-between gap-4">
                <span className="space-y-1">
                  <span className="font-heading block text-xl font-bold sm:text-2xl">{item.name}</span>
                  {item.description && <span className="text-muted-foreground block text-sm font-normal">{item.description}</span>}
                </span>
                <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", tint)}>
                  <Icon aria-hidden className="size-5" />
                </span>
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Every panel sits in the same cell; hidden copies of all of them hold the cell at the tallest one,
          so switching competitions never moves the page below. */}
      <div className="grid">
        {items.map((item) => (
          <div key={`size-${item.id}`} aria-hidden inert className="invisible col-start-1 row-start-1">
            <CompetitionDetail item={item} labels={labels} />
          </div>
        ))}
        {items.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className={cn("col-start-1 row-start-1 motion-safe:animate-in motion-safe:fade-in-0", fade)}
          >
            <CompetitionDetail item={item} labels={labels} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
