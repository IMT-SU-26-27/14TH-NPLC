import Image from "next/image";
import { BoxIcon } from "lucide-react";
import type { AuthHeroProps } from "@/types/auth";

// Dark navy page header for the auth pages, with the mascot and a slanted bottom edge.
export function AuthHero({ step, eyebrow, title, subtitle, mascot = "/auth/maskot-2.webp" }: AuthHeroProps) {
  return (
    <section className="bg-band text-band-foreground relative [clip-path:polygon(0_0,100%_0,100%_86%,0_100%)]">
      <div aria-hidden className="absolute inset-0 [background:var(--band-grid)]" />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 pt-12 pb-20 sm:pt-14 sm:pb-24">
        <div className="space-y-4">
          <p className="text-brand-sky flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase sm:text-sm">
            <BoxIcon aria-hidden className="text-brand-purple size-4" />
            {step} {"//"} {eyebrow ?? title}
          </p>
          <h1 className="text-4xl font-bold tracking-wider text-balance uppercase sm:text-6xl">{title}</h1>
          <p className="text-band-muted max-w-3xl text-base text-pretty sm:text-xl">{subtitle}</p>
        </div>
        <Image
          src={mascot}
          alt=""
          width={454}
          height={454}
          priority
          className="hidden size-40 shrink-0 object-contain drop-shadow-2xl sm:block md:size-52"
        />
      </div>
    </section>
  );
}
