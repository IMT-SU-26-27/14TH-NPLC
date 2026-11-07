import type { Competition } from "@/types/competition";
import type { Locale } from "@/types/i18n";

export type CommitteeContact = {
  name: string | null;
  whatsapp: string | null;
};

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
  saveLabel: string | null;
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

export type MobileNavProps = {
  links: SectionLink[];
  accountLinks: SectionLink[];
};

export type HeaderActionsProps = {
  lang: Locale;
  sections: SectionLink[];
};
