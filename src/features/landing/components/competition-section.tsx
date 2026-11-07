import { cacheLife, cacheTag } from "next/cache";
import { TrophyIcon } from "lucide-react";
import { COMPETITIONS_TAG, getActiveCompetitions, isRegistrationOpen } from "@/lib/data/competitions";
import { EARLY_BIRD, isEarlyBird } from "@/lib/event-info";
import { formatDateRange, formatDateTime, formatRupiah, formatTeamSize } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { CompetitionPicker } from "@/features/landing/components/competition-picker";
import type { LangProps } from "@/types/i18n";
import type { CompetitionPickerItem } from "@/types/landing";

// "02 // Lomba": formats every label here so the client picker only switches between them.
export async function CompetitionSection({ lang }: LangProps) {
  "use cache";
  cacheLife("minutes");
  cacheTag(COMPETITIONS_TAG);

  const t = getT(lang);
  const now = new Date();
  const competitions = await getActiveCompetitions();

  if (competitions.length === 0) {
    return (
      <Empty className="bg-card border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>{t("competition.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("competition.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // The early bird only shows while it runs and only when it is actually cheaper than the set fee.
  const earlyBird = isEarlyBird(now);
  const earlyRange = formatDateRange(EARLY_BIRD.startsOn, EARLY_BIRD.endsOn, lang);

  const items: CompetitionPickerItem[] = competitions.map((c) => {
    const discounted = earlyBird && c.fee > EARLY_BIRD.fee;
    const extraMin = Math.max(c.min_members - 1, 0);
    const extraMax = Math.max(c.max_members - 1, 0);
    const range = extraMin === extraMax ? `${extraMax}` : `${extraMin}–${extraMax}`;

    return {
      id: c.id,
      type: c.type,
      name: c.name,
      description: c.description,
      membersLabel: formatTeamSize(c.min_members, c.max_members, lang),
      membersHint: extraMax === 0 ? t("landing.competitions.leaderOnly") : t("landing.competitions.leaderPlus", { range }),
      normalFee: formatRupiah(c.fee, lang),
      earlyFee: discounted ? formatRupiah(EARLY_BIRD.fee, lang) : null,
      saveLabel: discounted ? t("landing.competitions.save", { amount: formatRupiah(c.fee - EARLY_BIRD.fee, lang) }) : null,
      earlyRange: discounted ? t("landing.competitions.earlyBirdRange", { range: earlyRange }) : null,
      open: isRegistrationOpen(c, now),
      closesLabel: c.registration_closes_at ? t("landing.competitions.closes", { date: formatDateTime(c.registration_closes_at, lang) }) : null,
      href: localePath(lang, `/register/${c.slug}`),
      ctaLabel: t("landing.competitions.registerCta", { short: t(`landing.competitions.short.${c.type}`) }),
    };
  });

  return (
    <CompetitionPicker
      items={items}
      labels={{
        selected: t("landing.competitions.selected"),
        members: t("landing.competitions.members"),
        fee: t("landing.competitions.fee"),
        normalPrice: t("landing.competitions.normalPrice"),
        earlyPrice: t("landing.competitions.earlyPrice"),
        open: t("competition.open"),
        closed: t("competition.closed"),
        registrationClosed: t("competition.registrationClosed"),
      }}
    />
  );
}
