import { cacheLife, cacheTag } from "next/cache";
import { COMPETITIONS_TAG, getActiveCompetitions, isRegistrationOpen } from "@/lib/data/competitions";
import { EARLY_BIRD, isEarlyBird } from "@/lib/event-info";
import { formatDateRange } from "@/lib/format";
import { Hero } from "@/features/landing/components/hero";
import type { LangProps } from "@/types/i18n";

// Server half of the homepage hero: works out the "registration open · early bird until" line.
export async function AboutHero({ lang }: LangProps) {
  "use cache";
  cacheLife("minutes");
  cacheTag(COMPETITIONS_TAG);

  const now = new Date();
  const competitions = await getActiveCompetitions();
  const open = competitions.some((c) => isRegistrationOpen(c, now));
  const earlyBirdDate = isEarlyBird(now) ? formatDateRange(EARLY_BIRD.endsOn, null, lang) : null;

  return <Hero status={{ open, earlyBirdDate }} />;
}
