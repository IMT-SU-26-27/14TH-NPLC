import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { DashboardEmptyOptionProps } from "@/types/registration";

// One way to start, inside the empty dashboard card: register a team as leader, or join one with a code.
// The button sits at the bottom so both options line up whatever their text length.
export function DashboardEmptyOption({ label, title, description, href, cta, icon: Icon, variant }: DashboardEmptyOptionProps) {
  const leader = variant === "leader";

  return (
    <div className="bg-card-muted ring-border flex flex-col gap-3 rounded-[12px] p-4 ring-1">
      <div className="flex items-center justify-between gap-3">
        <p className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{label}</p>
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            leader ? "bg-primary text-primary-foreground" : "bg-highlight text-foreground",
          )}
        >
          <Icon className="size-[18px]" />
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-lg leading-tight font-bold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: leader ? "default" : "outline" }),
          "mt-auto h-11 w-full rounded-[8px] px-4.5",
          leader ? "bg-highlight text-highlight-foreground hover:bg-highlight/80" : "border-primary text-primary",
        )}
      >
        {cta}
        {leader && <ArrowRightIcon />}
      </Link>
    </div>
  );
}
