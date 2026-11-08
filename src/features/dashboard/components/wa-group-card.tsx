import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/shared/whatsapp-icon";
import type { WaGroupCardProps } from "@/types/registration";

// Right column of the dashboard, under "one account, one team": the participants' WhatsApp group. Rendered only when
// the database hands over a link (see getMyWaGroup), so the page never decides who may see it.
export function WaGroupCard({ group, lang }: WaGroupCardProps) {
  const t = getT(lang);

  return (
    <section className="bg-card ring-border space-y-3 rounded-[12px] p-6 ring-1 sm:p-7">
      <h2 className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("dashboard.waGroupLabel")}`}</h2>
      <p className="text-muted-foreground text-sm">{t("dashboard.waGroupText", { competition: group.competition_name })}</p>
      <a
        href={group.wa_group_url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants(), "w-full rounded-[8px]")}
      >
        <WhatsappIcon data-icon="inline-start" />
        {t("dashboard.waGroupButton")}
        <span className="sr-only">{` (${t("landing.contact.opensWhatsapp")})`}</span>
      </a>
    </section>
  );
}
