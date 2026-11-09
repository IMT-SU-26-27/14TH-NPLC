import { getT } from "@/lib/i18n/get-dictionary";
import { INSTAGRAM } from "@/lib/event-info";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { InstagramIcon } from "@/components/shared/instagram-icon";
import { WhatsappIcon } from "@/components/shared/whatsapp-icon";
import type { WaGroupCardProps } from "@/types/registration";

// In the team card, right under the status history: the participants' WhatsApp group and the Instagram account to
// follow. Rendered only when the database hands over a link (see getMyWaGroup), so the page never decides who may see it.
export function WaGroupCard({ group, lang }: WaGroupCardProps) {
  const t = getT(lang);

  return (
    <section id="grup-peserta" className="bg-card-muted ring-border scroll-mt-20 space-y-3 rounded-[12px] p-4 ring-1 sm:p-5">
      <h3 className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("dashboard.waGroupLabel")}`}</h3>
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
      <a
        href={INSTAGRAM.url}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-sm text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3"
      >
        <InstagramIcon aria-hidden className="text-primary size-4 shrink-0" />
        {t("dashboard.nextInstagram", { handle: INSTAGRAM.handle })}
      </a>
    </section>
  );
}
