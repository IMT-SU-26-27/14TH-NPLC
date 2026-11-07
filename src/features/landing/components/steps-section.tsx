import { getT } from "@/lib/i18n/get-dictionary";
import { SectionHeading } from "@/features/landing/components/section-heading";
import type { LangProps } from "@/types/i18n";

const STEPS = ["account", "register", "share", "verify"] as const;

// "03 // Cara daftar": four numbered steps joined by a line (a vertical list on phones).
export function StepsSection({ lang }: LangProps) {
  const t = getT(lang);

  return (
    <section id="how-to-register" className="mx-auto max-w-6xl scroll-mt-14 space-y-10 px-4 py-20 sm:py-28">
      <SectionHeading index="03" label={t("landing.steps.label")} title={t("landing.steps.title")} lead={t("landing.steps.lead")} />
      <ol className="grid gap-8 md:grid-cols-4 md:gap-6">
        {STEPS.map((step, i) => {
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={step} className="relative flex gap-4 md:flex-col md:gap-0">
              {/* Connector: to the next step's circle, sideways on desktop and downwards on phones. */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="bg-primary/40 absolute top-9 bottom-[-2rem] left-4 w-px md:top-4 md:right-[-1.5rem] md:bottom-auto md:left-9 md:h-px md:w-auto"
                />
              )}
              <span className="border-primary text-primary bg-background relative flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs">
                {n}
              </span>
              <div className="space-y-1.5 md:mt-6">
                <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">{t("landing.steps.step", { n })}</p>
                <h3 className="text-lg font-bold">{t(`landing.steps.${step}Title`)}</h3>
                <p className="text-muted-foreground text-sm">{t(`landing.steps.${step}Body`)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
