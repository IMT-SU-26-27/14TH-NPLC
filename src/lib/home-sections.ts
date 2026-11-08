import { localePath } from "@/lib/i18n/config";
import type { Locale } from "@/types/i18n";
import type { HomeSection, SectionLink } from "@/types/landing";

// Homepage section anchors in each language (/id#lomba, /en#competitions). The only place these ids are written:
// the sections, the header, the phone menu and the hero all read them from here.
export const HOME_SECTION_IDS: Record<Locale, Record<HomeSection, string>> = {
  id: {
    about: "tentang",
    competitions: "lomba",
    howToRegister: "cara-daftar",
    timeline: "timeline",
    fees: "biaya",
    faq: "faq",
    contact: "kontak",
  },
  en: {
    about: "about",
    competitions: "competitions",
    howToRegister: "how-to-register",
    timeline: "timeline",
    fees: "fees",
    faq: "faq",
    contact: "contact",
  },
};

// The sections in the header and the phone menu, in page order.
const NAV_SECTIONS = ["about", "competitions", "timeline", "fees", "faq"] as const satisfies readonly HomeSection[];

export function sectionId(lang: Locale, section: HomeSection): string {
  return HOME_SECTION_IDS[lang][section];
}

export function sectionHref(lang: Locale, section: HomeSection): string {
  return `${localePath(lang, "/")}#${sectionId(lang, section)}`;
}

export function homeSectionLinks(lang: Locale, t: (key: string) => string): SectionLink[] {
  return NAV_SECTIONS.map((section) => ({ href: sectionHref(lang, section), label: t(`nav.${section}`) }));
}

// Scrolls to a section on the current page, even when the URL already ends in its hash (a plain hash link does
// nothing then). Smooth only when the visitor allows motion; the sections' scroll-margin keeps the heading clear
// of the sticky header. Replaces the hash so Back does not step through every section visited.
export function scrollToSection(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
  return true;
}
