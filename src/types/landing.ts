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
