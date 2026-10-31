import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
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
  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/", hash: "#timeline", label: t("landing.timelineTitle") },
    { href: "/", hash: "#competitions", label: t("landing.competitionsTitle") },
    { href: "/join", label: t("nav.joinTeam") },
    { href: "/dashboard", label: t("nav.dashboard") },
  ];

  return (
    <footer className="bg-background mt-auto border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Link href={localePath(lang, "/")} className="inline-block">
            <Image src="/shared/logo-nplc-xiv.webp" alt={t("meta.siteName")} width={138} height={28} />
          </Link>
          <p className="text-muted-foreground max-w-sm text-sm">{t("footer.tagline")}</p>
        </div>
        <nav aria-label={t("footer.navigate")} className="-mx-2.5 flex flex-wrap gap-1 sm:justify-end">
          {links.map((link) => (
            <Link
              key={link.label}
              href={`${localePath(lang, link.href)}${link.hash ?? ""}`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <Separator />
      <p className="text-muted-foreground mx-auto max-w-6xl px-4 py-6 text-xs">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
}
