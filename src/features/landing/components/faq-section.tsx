import { PlusIcon } from "lucide-react";
import { getDictionary, getT } from "@/lib/i18n/get-dictionary";
import { sectionId } from "@/lib/home-sections";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SectionHeading } from "@/features/landing/components/section-heading";
import type { LangProps } from "@/types/i18n";

// "06 // FAQ": one combined list for both competitions, from the dictionary (landing.faq.items). The first answer
// starts open, as in the Figma.
export function FaqSection({ lang }: LangProps) {
  const t = getT(lang);
  const items = getDictionary(lang).landing.faq.items;

  return (
    <section id={sectionId(lang, "faq")} className="bg-brand-purple/10 scroll-mt-14 pt-28 pb-20 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-36 sm:pb-28">
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <SectionHeading index="06" label={t("landing.faq.label")} title={t("landing.faq.title")} />
        <div className="space-y-3">
          {items.map((item, i) => (
            <Collapsible key={item.q} defaultOpen={i === 0} className="bg-card ring-border rounded-[12px] ring-1">
              <CollapsibleTrigger className="group/faq focus-visible:ring-ring/50 flex w-full items-center gap-4 rounded-[12px] px-5 py-4 text-left outline-none focus-visible:ring-3">
                <span className="text-primary w-10 shrink-0 font-mono text-xs">{`Q.${i + 1}`}</span>
                <span className="flex-1 font-semibold">{item.q}</span>
                <PlusIcon aria-hidden className="text-primary size-4 shrink-0 transition-transform group-data-panel-open/faq:rotate-45" />
              </CollapsibleTrigger>
              <CollapsibleContent className="text-muted-foreground px-5 pb-5 pl-19 text-sm">{item.a}</CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
}
