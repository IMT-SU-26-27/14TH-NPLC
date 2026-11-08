import Link from "next/link";
import { ArrowRightIcon, ClockIcon, UsersIcon, WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CompetitionDetailProps } from "@/types/landing";

const microLabel = "text-primary flex items-center gap-1.5 font-mono text-xs tracking-[0.2em] uppercase";

// The chosen competition's members, fee and deadline. Fills its cell, so the footer stays put when the text is shorter.
export function CompetitionDetail({ item, labels }: CompetitionDetailProps) {
  return (
    <Card className="ring-border h-full gap-0 rounded-[12px] py-0">
      <CardContent className="grid flex-1 content-start gap-6 p-5 sm:grid-cols-2 sm:p-6">
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
            <span
              aria-hidden
              className={cn("size-2 rounded-full", !item.open ? "bg-muted-foreground" : item.full ? "bg-destructive" : "bg-highlight ring-highlight-foreground/40 ring-1")}
            />
            {!item.open ? labels.closed : item.full ? labels.full : labels.open}
          </Badge>
          {item.closesLabel && (
            <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase">
              <ClockIcon aria-hidden className="size-3.5" />
              {item.closesLabel}
            </span>
          )}
        </div>
        {item.open && !item.full ? (
          <Link
            href={item.href}
            className={cn(buttonVariants({ size: "lg" }), "bg-highlight text-highlight-foreground hover:bg-highlight/80 h-11 px-5 max-sm:w-full")}
          >
            {item.ctaLabel}
            <ArrowRightIcon />
          </Link>
        ) : (
          <span aria-disabled className={cn(buttonVariants({ size: "lg", variant: "outline" }), "pointer-events-none h-11 opacity-60 max-sm:w-full")}>
            {item.open ? labels.quotaFull : labels.registrationClosed}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
