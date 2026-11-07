import { getT } from "@/lib/i18n/get-dictionary";
import type { RegisterStepsProps } from "@/types/registration";

const STEPS = [
  { id: "step-team", title: "register.stepTeam", hint: "register.stepTeamHint" },
  { id: "step-leader", title: "register.stepLeader", hint: "register.stepLeaderHint" },
  { id: "step-payment", title: "register.stepPayment", hint: "register.stepPaymentHint" },
  { id: "step-twibbon", title: "register.stepTwibbon", hint: "register.stepTwibbonHint" },
] as const;

// "// Langkah": jump links to the four form sections. A column beside the form on desktop, a row above it on phones.
export function RegisterSteps({ lang }: RegisterStepsProps) {
  const t = getT(lang);

  return (
    <nav aria-label={t("register.stepsLabel")} className="space-y-4 lg:sticky lg:top-20">
      <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">{`// ${t("register.stepsLabel")}`}</p>
      <ol className="grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-0">
        {STEPS.map((step, i) => (
          <li key={step.id} className="relative lg:pb-6 lg:last:pb-0">
            {i < STEPS.length - 1 && <span aria-hidden className="bg-border absolute top-8 bottom-0 left-3.5 hidden w-px lg:block" />}
            <a href={`#${step.id}`} className="group flex flex-col items-center gap-1.5 text-center lg:flex-row lg:items-start lg:gap-3 lg:text-left">
              <span className="border-primary text-primary bg-background group-hover:bg-primary group-hover:text-primary-foreground relative flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors">
                {i + 1}
              </span>
              <span>
                <span className="block text-xs font-semibold lg:text-sm">{t(step.title)}</span>
                <span className="text-muted-foreground hidden text-xs lg:block">{t(step.hint)}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
