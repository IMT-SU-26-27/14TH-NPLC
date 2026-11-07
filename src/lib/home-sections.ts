import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/types/i18n";
import type { SectionLink } from "@/types/landing";

// Homepage sections linked from the header and footer. The ids match the section ids in src/features/landing.
export function homeSectionLinks(lang: Locale): SectionLink[] {
  const t = getT(lang);
  const home = localePath(lang, "/");
  return [
    { href: `${home}#about`, label: t("nav.about") },
    { href: `${home}#competitions`, label: t("nav.competitions") },
    { href: `${home}#timeline`, label: t("nav.timeline") },
    { href: `${home}#fees`, label: t("nav.fees") },
    { href: `${home}#faq`, label: t("nav.faq") },
  ];
}
