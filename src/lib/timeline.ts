import type { CompetitionType } from "@/types/competition";
import type { TimelineEvent } from "@/types/content";

// Today's date in WIB as "YYYY-MM-DD", comparable with the date-only timeline columns.
export function todayInWib(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// The next date for a competition's teams: the first event for that competition (or for every competition) that has
// not started yet; once none is left, the one still running. Events come ordered by start date.
export function nextEventFor(events: TimelineEvent[], type: CompetitionType, today: string): TimelineEvent | null {
  const relevant = events.filter((event) => event.competition_type === null || event.competition_type === type);
  return relevant.find((event) => event.starts_on > today) ?? relevant.find((event) => (event.ends_on ?? event.starts_on) >= today) ?? null;
}

// The competition's main day: its last event on the timeline (for the Rally, the final day at the campus).
export function lastEventFor(events: TimelineEvent[], type: CompetitionType): TimelineEvent | null {
  return events.filter((event) => event.competition_type === null || event.competition_type === type).at(-1) ?? null;
}
