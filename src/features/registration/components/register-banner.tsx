import Image from "next/image";
import { BoxIcon } from "lucide-react";
import type { RegisterBannerProps } from "@/types/registration";

// Navy page header from the Figma registration frames ("08 // Daftar tim", "09 // Form daftar", "10 // Gabung tim").
// The optional mascot sits on the right from lg up, where it clears the lead text.
export function RegisterBanner({ index, label, title, lead, mascot }: RegisterBannerProps) {
  return (
    <section className="bg-foreground relative isolate pt-12 pb-20 [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_3rem),0_100%)] sm:pt-16 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--background)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--background)_6%,transparent)_1px,transparent_1px)] bg-size-[48px_48px]"
      />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="space-y-3">
          <p className="text-brand-sky flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase">
            <BoxIcon aria-hidden className="text-brand-purple size-3.5 shrink-0" />
            {`${index} // ${label}`}
          </p>
          <h1 className="text-background text-3xl font-bold tracking-tight text-balance uppercase sm:text-5xl">{title}</h1>
          <p className="text-background/70 max-w-2xl sm:text-lg">{lead}</p>
        </div>
        {mascot && (
          <Image
            src={mascot}
            alt=""
            width={446}
            height={446}
            priority
            sizes="160px"
            className="absolute right-4 -top-2 h-auto w-40 max-lg:hidden"
          />
        )}
      </div>
    </section>
  );
}
