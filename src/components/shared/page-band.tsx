import Image from "next/image";
import { BoxIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageBandProps } from "@/types";

// Navy title band at the top of a page ("02 // Masuk", "08 // Daftar tim", ...), from the final design.
// The mascot is decoration for wide screens only; phones get the band without it.
export function PageBand({ index, label, title, lead, mascot, children }: PageBandProps) {
  return (
    <section className="bg-band relative isolate pt-12 pb-20 [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_3rem),0_100%)] sm:pt-16 sm:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [background:var(--band-grid)]" />
      {/* With a mascot, the text keeps clear of it: right 12% of the viewport, 168px wide. */}
      <div className={cn("mx-auto max-w-6xl space-y-3 px-4", mascot && "md:pr-[calc(12vw+176px)]")}>
        <p className="text-brand-sky flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase">
          <BoxIcon aria-hidden className="text-brand-purple size-3.5 shrink-0" />
          {`${index} // ${label}`}
        </p>
        <h1 className="text-band-foreground text-3xl font-bold tracking-tight text-balance uppercase sm:text-5xl">{title}</h1>
        {lead && <p className="text-band-muted max-w-2xl sm:text-lg">{lead}</p>}
        {children}
      </div>
      {mascot && (
        <div aria-hidden={mascot.alt ? undefined : true} className="pointer-events-none absolute right-[12%] bottom-13 hidden w-42 md:block">
          {/* Ground shadow under the feet: the design's lighter ellipse, at the strength of the grid lines. */}
          <span className="absolute bottom-0 left-1 h-5 w-[150px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--background)_6%,transparent),color-mix(in_oklch,var(--background)_2.5%,transparent)_55%,transparent)]" />
          <Image src={mascot.src} alt={mascot.alt ?? ""} width={168} height={168} className="relative h-auto w-full" />
        </div>
      )}
    </section>
  );
}
