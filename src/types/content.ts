import type { Tables } from "@/types/database";
import type { Locale } from "@/types/i18n";

export type SiteContent = Tables<"site_content">;
export type TimelineEvent = Tables<"timeline_events">;

export type AboutFormProps = {
  content: SiteContent;
};

export type TimelineManagerProps = {
  events: TimelineEvent[];
};

export type TimelineEventDialogProps = {
  event: TimelineEvent | null;
};

export type TimelineSectionProps = {
  lang: Locale;
};

export type TimelineListProps = {
  events: TimelineEvent[];
  lang: Locale;
};

export type DeleteTimelineEventButtonProps = {
  eventId: string;
};

export type HeroProps = {
  title: string;
  paragraphs: string[];
};

export type MarkdownProps = {
  children: string;
};
