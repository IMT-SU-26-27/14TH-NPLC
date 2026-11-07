import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { MessageCircleIcon } from "lucide-react";
import { COMMITTEE_CONTACT, whatsappUrl } from "@/lib/event-info";
import { cn } from "@/lib/utils";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { LangProps } from "@/types/i18n";

// Cached per language and day: the copyright year is the only moving part.
export async function SiteFooter({ lang }: LangProps) {
  "use cache";
  cacheLife("days");

  const t = getT(lang);
  const home = localePath(lang, "/");
  const links = [
    { href: home, label: t("nav.home") },
    { href: `${home}#competitions`, label: t("nav.competitions") },
    { href: `${home}#timeline`, label: t("nav.timeline") },
    { href: `${home}#faq`, label: t("nav.faq") },
    { href: localePath(lang, "/dashboard"), label: t("nav.dashboard") },
  ];
  const { name, whatsapp } = COMMITTEE_CONTACT;

  return (
    <footer className="bg-background mt-auto border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr_auto]">
        <div className="space-y-2">
          <Link href={localePath(lang, "/")} className="inline-block">
            <Image src="/shared/logo-nplc-xiv.webp" alt={t("meta.siteName")} width={138} height={28} />
          </Link>
          <p className="text-muted-foreground max-w-sm text-sm">{t("footer.tagline")}</p>
        </div>
        <nav aria-label={t("footer.navigate")} className="space-y-2">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">{`// ${t("footer.navigate")}`}</p>
          <div className="-mx-2.5 flex flex-wrap gap-1">
            {links.map((link) => (
              <Link key={link.label} href={link.href} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="space-y-2">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">{`// ${t("footer.contact")}`}</p>
          {whatsapp ? (
            <a
              href={whatsappUrl(whatsapp)}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-mx-2.5 h-auto py-1 whitespace-normal")}
            >
              <MessageCircleIcon data-icon="inline-start" />
              {[t("footer.whatsapp"), name, `+${whatsapp}`].filter(Boolean).join(" · ")}
            </a>
          ) : (
            <p className="text-muted-foreground text-sm">{t("landing.contact.soon")}</p>
          )}
        </div>
      </div>
      <Separator />
      <p className="text-muted-foreground mx-auto max-w-6xl px-4 py-6 font-mono text-xs tracking-[0.2em] uppercase">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
}
