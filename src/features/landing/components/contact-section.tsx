import Image from "next/image";
import { MessageCircleIcon } from "lucide-react";
import { COMMITTEE_CONTACTS, whatsappUrl } from "@/lib/event-info";
import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { LangProps } from "@/types/i18n";

// "07 // Kontak": blue band with the waving mascot and one WhatsApp button per competition's contact person.
export function ContactSection({ lang }: LangProps) {
  const t = getT(lang);

  return (
    <section
      id="contact"
      className="bg-primary text-primary-foreground relative isolate overflow-hidden py-24 [clip-path:polygon(0_3rem,100%_0,100%_calc(100%_-_3rem),0_100%)] sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="font-mono text-xs tracking-[0.2em] uppercase">{`07 // ${t("landing.contact.label")}`}</p>
          <h2 className="font-display text-[36px] leading-[1.08] font-extrabold tracking-[0.01em] uppercase sm:text-[48px]">{t("landing.contact.title")}</h2>
          <span aria-hidden className="bg-highlight block h-1 w-16 rounded-full" />
          <p>{t("landing.contact.lead")}</p>
          <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:flex-wrap sm:gap-3">
            {COMMITTEE_CONTACTS.map((contact) => (
              <a
                key={contact.whatsapp}
                href={whatsappUrl(contact.whatsapp)}
                target="_blank"
                rel="noopener"
                className={cn(buttonVariants({ size: "lg" }), "bg-highlight text-highlight-foreground hover:bg-highlight/80 h-11 w-full px-5 sm:w-auto")}
              >
                <MessageCircleIcon data-icon="inline-start" />
                {`${contact.competition} · ${contact.name}`}
                <span className="sr-only">{` (${t("landing.contact.opensWhatsapp")})`}</span>
              </a>
            ))}
          </div>
        </div>
        <div aria-hidden className="relative mx-auto w-56 sm:w-72">
          <div className="bg-primary-foreground/20 absolute inset-6 -z-10 rounded-full blur-3xl" />
          <Image src="/shared/maskot-4.webp" alt="" width={446} height={446} sizes="(min-width: 640px) 288px, 224px" className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
