import Image from "next/image";
import { MessageCircleIcon } from "lucide-react";
import { COMMITTEE_CONTACT, whatsappUrl } from "@/lib/event-info";
import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { LangProps } from "@/types/i18n";

// "07 // Kontak": blue band with the waving mascot. Until the committee number is set, says it is coming.
export function ContactSection({ lang }: LangProps) {
  const t = getT(lang);
  const { name, whatsapp } = COMMITTEE_CONTACT;

  return (
    <section
      id="contact"
      className="bg-primary text-primary-foreground relative isolate overflow-hidden py-24 [clip-path:polygon(0_3rem,100%_0,100%_calc(100%_-_3rem),0_100%)] sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="text-primary-foreground/80 font-mono text-xs tracking-[0.2em] uppercase">{`07 // ${t("landing.contact.label")}`}</p>
          <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-5xl">{t("landing.contact.title")}</h2>
          <span aria-hidden className="bg-highlight block h-1 w-16 rounded-full" />
          <p className="text-primary-foreground/85">{t("landing.contact.lead")}</p>
          {whatsapp ? (
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={whatsappUrl(whatsapp)}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "bg-highlight text-highlight-foreground hover:bg-highlight/80 h-11 px-5")}
              >
                <MessageCircleIcon data-icon="inline-start" />
                {t("landing.contact.cta")}
              </a>
              <p className="text-primary-foreground/80 font-mono text-xs tracking-[0.15em] uppercase">
                {[name, `+${whatsapp}`].filter(Boolean).join(" · ")}
              </p>
            </div>
          ) : (
            <p className="text-primary-foreground/80 pt-2 font-mono text-xs tracking-[0.15em] uppercase">{t("landing.contact.soon")}</p>
          )}
        </div>
        <div aria-hidden className="relative mx-auto w-56 sm:w-72">
          <div className="bg-primary-foreground/20 absolute inset-6 -z-10 rounded-full blur-3xl" />
          <Image src="/landing/maskot-4.webp" alt="" width={446} height={446} sizes="(min-width: 640px) 288px, 224px" className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
