import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { CameraIcon, MessageCircleIcon } from "lucide-react";
import { COMMITTEE_CONTACTS, INSTAGRAM, whatsappUrl } from "@/lib/event-info";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Separator } from "@/components/ui/separator";
import type { LangProps } from "@/types/i18n";

const columnLabel = "text-primary font-mono text-xs tracking-[0.2em] uppercase";
const footerLink = "hover:text-primary focus-visible:ring-ring/50 inline-flex items-start gap-2 rounded-sm text-sm outline-none focus-visible:ring-3";

// Cached per language and day: the copyright year is the only moving part.
export async function SiteFooter({ lang }: LangProps) {
  "use cache";
  cacheLife("days");

  const t = getT(lang);

  return (
    <footer className="bg-background mt-auto border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr_auto] md:gap-12">
        <div className="space-y-3">
          <Link href={localePath(lang, "/")} className="inline-block">
            <Image src="/shared/logo-nplc-xiv.webp" alt={t("meta.siteName")} width={138} height={28} />
          </Link>
          <p className="text-muted-foreground max-w-sm text-sm">{t("footer.tagline")}</p>
        </div>
        <div className="space-y-3">
          <p className={columnLabel}>{`// ${t("footer.contact")}`}</p>
          <ul className="space-y-2">
            {COMMITTEE_CONTACTS.map((contact) => (
              <li key={contact.whatsapp}>
                <a href={whatsappUrl(contact.whatsapp)} target="_blank" rel="noopener" className={footerLink}>
                  <MessageCircleIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {t("footer.contactLine", { competition: contact.competition, name: contact.name })}{" "}
                    <span className="whitespace-nowrap tabular-nums">{contact.display}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <p className={columnLabel}>{`// ${t("footer.social")}`}</p>
          <a href={INSTAGRAM.url} target="_blank" rel="noopener" className={footerLink}>
            <CameraIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              <span className="sr-only">{`${t("footer.instagram")} `}</span>
              {INSTAGRAM.handle}
            </span>
          </a>
        </div>
      </div>
      <Separator />
      <p className="text-muted-foreground mx-auto max-w-6xl px-4 py-6 font-mono text-xs tracking-[0.2em] uppercase">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
}
