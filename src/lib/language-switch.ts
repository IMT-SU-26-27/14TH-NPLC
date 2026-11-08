import { HOME_SECTION_IDS } from "@/lib/home-sections";
import { stripLocale } from "@/lib/i18n/config";
import type { Locale } from "@/types/i18n";
import type { HomeSection, LanguageSwitchPosition } from "@/types/landing";

const KEY = "nplc:language-switch";
// A saved position older than this is ignored (the visitor went somewhere else first).
const MAX_AGE_MS = 15_000;
// The sticky header covers the top of the screen; a section counts as "on screen" once it passes below it.
const HEADER_PX = 64;

const SECTIONS = Object.keys(HOME_SECTION_IDS.id) as HomeSection[];

function sectionTop(id: string): number | null {
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
}

function scrollRange(): number {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

// Reads where the visitor is: the section on screen (homepage) or how far down the page is (other pages). Called when
// the language menu opens, before the menu can lock scrolling.
export function captureLanguagePosition(from: Locale): Omit<LanguageSwitchPosition, "to" | "at"> {
  const onHome = stripLocale(window.location.pathname) === "/";
  let section: HomeSection | null = null;
  let offset = 0;
  if (onHome) {
    const y = window.scrollY + HEADER_PX;
    for (const key of SECTIONS) {
      const top = sectionTop(HOME_SECTION_IDS[from][key]);
      if (top !== null && top <= y && (section === null || top > (sectionTop(HOME_SECTION_IDS[from][section]) ?? -1))) {
        section = key;
        offset = window.scrollY - top;
      }
    }
  }
  const hashId = decodeURIComponent(window.location.hash.slice(1));
  const hash = onHome ? (SECTIONS.find((key) => HOME_SECTION_IDS[from][key] === hashId) ?? null) : null;
  return { section, offset, ratio: window.scrollY / scrollRange(), hash };
}

// Saves the captured position for the page being opened. Storage may be blocked; then the new page simply opens where
// Next.js leaves it.
export function rememberLanguagePosition(captured: Omit<LanguageSwitchPosition, "to" | "at">, toPath: string): void {
  const position: LanguageSwitchPosition = { ...captured, to: toPath, at: Date.now() };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(position));
  } catch {
    // Private mode or storage off.
  }
}

// The saved position for this page, removed once read so it is used once.
export function takeLanguagePosition(pathname: string): LanguageSwitchPosition | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const position = JSON.parse(raw) as LanguageSwitchPosition;
    if (position.to !== pathname) return null;
    sessionStorage.removeItem(KEY);
    return Date.now() - position.at <= MAX_AGE_MS ? position : null;
  } catch {
    return null;
  }
}

// The scroll position in the new language: the same section and offset on the homepage, otherwise the same
// fraction of the page. Null while the section is not rendered yet.
export function languagePositionTop(position: LanguageSwitchPosition, lang: Locale): number | null {
  if (position.section) {
    const top = sectionTop(HOME_SECTION_IDS[lang][position.section]);
    return top === null ? null : top + position.offset;
  }
  return position.ratio * scrollRange();
}

export function languagePositionHash(position: LanguageSwitchPosition, lang: Locale): string | null {
  return position.hash ? `#${HOME_SECTION_IDS[lang][position.hash]}` : null;
}
