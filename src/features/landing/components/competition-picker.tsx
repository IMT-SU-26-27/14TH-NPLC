"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ClockIcon, CodeXmlIcon, NetworkIcon, UsersIcon, WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CompetitionPickerProps } from "@/types/landing";

const TYPE_ICON = {
  competitive_programming: { icon: CodeXmlIcon, tint: "bg-primary text-primary-foreground" },
  logic: { icon: NetworkIcon, tint: "bg-highlight text-highlight-foreground" },
} as const;

const microLabel = "text-primary flex items-center gap-1.5 font-mono text-xs tracking-[0.2em] uppercase";

// Two selectable competition cards with the chosen one's members, fee and deadline underneath.
export function CompetitionPicker({ items, labels }: CompetitionPickerProps) {
  return (
    <Tabs defaultValue={items[0].id} className="gap-4">
      <TabsList
        variant="line"
        className="grid h-auto w-full grid-cols-1 gap-4 p-0 group-data-horizontal/tabs:h-auto md:grid-cols-2"
      >
        {items.map((item, i) => {
          const { icon: Icon, tint } = TYPE_ICON[item.type];
          return (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="group/pick text-foreground hover:border-primary/60 data-active:border-primary data-active:ring-primary/15 border-border h-auto flex-col items-stretch gap-2 rounded-xl p-5 text-left whitespace-normal group-data-[variant=line]/tabs-list:bg-card group-data-[variant=line]/tabs-list:data-active:bg-card after:hidden data-active:ring-4 sm:p-6"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
                  {`${String(i + 1).padStart(2, "0")} // ${item.name}`}
                </span>
                <Badge className="bg-highlight text-highlight-foreground hidden font-mono text-xs tracking-[0.15em] uppercase group-data-active/pick:inline-flex">
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

      {items.map((item) => (
        <TabsContent key={item.id} value={item.id}>
          <Card className="ring-border gap-0 rounded-xl py-0">
            <CardContent className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
              <div className="space-y-1">
                <p className={microLabel}>
                  <UsersIcon aria-hidden className="size-3.5" />
                  {labels.members}
                </p>
                <p className="font-heading text-2xl font-bold sm:text-3xl">{item.membersLabel}</p>
                <p className="text-muted-foreground text-sm">{item.membersHint}</p>
              </div>
              <div className="space-y-1 sm:border-l sm:pl-6">
                <p className={microLabel}>
                  <WalletIcon aria-hidden className="size-3.5" />
                  {labels.fee}
                </p>
                {item.earlyFee ? (
                  <>
                    <p className="text-muted-foreground text-sm line-through">
                      <span className="sr-only">{`${labels.normalPrice} `}</span>
                      {item.normalFee}
                    </p>
                    <p className="font-heading text-2xl font-bold sm:text-3xl">
                      <span className="sr-only">{`${labels.earlyPrice} `}</span>
                      {item.earlyFee}
                    </p>
                    <p className="text-muted-foreground text-sm">{item.earlyRange}</p>
                  </>
                ) : (
                  <p className="font-heading text-2xl font-bold sm:text-3xl">{item.normalFee}</p>
                )}
              </div>
            </CardContent>
            <div className="px-5 sm:px-6">
              <Separator />
            </div>
            <CardFooter className="flex-wrap justify-between gap-4 border-t-0 bg-transparent p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="font-mono text-xs tracking-[0.15em] uppercase">
                  <span aria-hidden className={cn("size-2 rounded-full", item.open ? "bg-highlight ring-highlight-foreground/40 ring-1" : "bg-muted-foreground")} />
                  {item.open ? labels.open : labels.closed}
                </Badge>
                {item.closesLabel && (
                  <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase">
                    <ClockIcon aria-hidden className="size-3.5" />
                    {item.closesLabel}
                  </span>
                )}
              </div>
              {item.open ? (
                <Link
                  href={item.href}
                  className={cn(buttonVariants({ size: "lg" }), "bg-highlight text-highlight-foreground hover:bg-highlight/80 h-11 px-5 max-sm:w-full")}
                >
                  {item.ctaLabel}
                  <ArrowRightIcon />
                </Link>
              ) : (
                <span className={cn(buttonVariants({ size: "lg", variant: "outline" }), "pointer-events-none h-11 opacity-60 max-sm:w-full")}>
                  {labels.registrationClosed}
                </span>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
