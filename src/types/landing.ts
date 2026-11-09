import type { ComponentProps } from "react";
import type Link from "next/link";
import type { COMMITTEE_CONTACTS } from "@/lib/event-info";
import type { Competition } from "@/types/competition";
import type { Locale } from "@/types/i18n";

export type CommitteeContact = (typeof COMMITTEE_CONTACTS)[number];

export type SectionTone = "light" | "dark";

export type SectionHeadingProps = {
  index: string;
  label: string;
  title: string;
  lead?: string;
  tone?: SectionTone;
};

// One competition with every label already formatted on the server, so the picker stays a thin client leaf.
export type ContactPersonLinkProps = {
  competitionType: string;
  // "opens WhatsApp in a new tab", for screen readers.
  opensLabel: string;
  className?: string;
};

export type CompetitionPickerItem = {
  id: string;
  type: Competition["type"];
  name: string;
  description: string | null;
  membersLabel: string;
  membersHint: string;
  normalFee: string;
  earlyFee: string | null;
  earlyRange: string | null;
  open: boolean;
  // Registration is open but the team quota is reached.
  full: boolean;
  closesLabel: string | null;
  href: string;
  ctaLabel: string;
};

export type CompetitionPickerProps = {
  items: CompetitionPickerItem[];
  labels: {
    selected: string;
    members: string;
    fee: string;
    normalPrice: string;
    earlyPrice: string;
    open: string;
    closed: string;
    registrationClosed: string;
    full: string;
    quotaFull: string;
  };
};

export type CompetitionDetailProps = {
  item: CompetitionPickerItem;
  labels: CompetitionPickerProps["labels"];
};

export type EarlyBirdRingProps = {
  totalDays: number;
  endsAt: string;
};

export type HeroStatus = {
  open: boolean;
  earlyBirdDate: string | null;
};

export type HeroProps = {
  status: HeroStatus;
};

export type SectionLink = {
  href: string;
  label: string;
};

export type HomeSection = "about" | "competitions" | "howToRegister" | "timeline" | "fees" | "faq" | "contact";

// Where the visitor was when they switched language, kept in sessionStorage until the new page restores it.
export type LanguageSwitchPosition = {
  // The page being opened (pathname, new language).
  to: string;
  // Homepage: the section at the top of the screen and how far into it, in px. Null above the first section.
  section: HomeSection | null;
  offset: number;
  // Any page: how far down, from 0 (top) to 1 (bottom). Used when there is no section.
  ratio: number;
  // Homepage: the section in the URL hash, to put back in the new language.
  hash: HomeSection | null;
  at: number;
};

export type SectionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  // Called instead of scrolling right away, for a menu that has to close (and unlock page scroll) first.
  onSectionClick?: (id: string) => void;
};

export type MobileNavProps = {
  links: SectionLink[];
  accountLinks: SectionLink[];
};

export type HeaderActionsProps = {
  lang: Locale;
  sections: SectionLink[];
};

export type GridBackdropProps = {
  // Fraction of the grid layer's own height it drifts in total as the band crosses the viewport.
  speed?: number;
};
