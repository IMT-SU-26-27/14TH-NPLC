import { BoxIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionHeadingProps } from "@/types/landing";

// "01 // TENTANG" eyebrow, uppercase title, gradient rule and lead, as in every Figma section.
export function SectionHeading({ index, label, title, lead, tone = "light" }: SectionHeadingProps) {
  const dark = tone === "dark";

  return (
    <div className="space-y-3">
      <p className={cn("flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase", dark ? "text-brand-sky" : "text-primary")}>
        <BoxIcon aria-hidden className="text-brand-purple size-3.5 shrink-0" />
        {`${index} // ${label}`}
      </p>
      <h2 className={cn("font-display text-[30px] leading-[1.08] min-[360px]:text-[36px] font-extrabold tracking-[0.01em] uppercase sm:text-[48px]", dark ? "text-band-foreground" : "text-foreground")}>
        {title}
      </h2>
      <span aria-hidden className="block h-1 w-16 rounded-full bg-(image:--tagline-gradient)" />
      {lead && <p className={cn("max-w-2xl pt-1", dark ? "text-band-muted" : "text-muted-foreground")}>{lead}</p>}
    </div>
  );
}
