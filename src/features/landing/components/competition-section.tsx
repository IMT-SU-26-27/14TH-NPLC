import { cacheLife, cacheTag } from "next/cache";
import { TrophyIcon } from "lucide-react";
import { COMPETITIONS_TAG, getActiveCompetitions, isRegistrationOpen } from "@/lib/data/competitions";
import { EARLY_BIRD } from "@/lib/event-info";
import { formatDateRange, formatDateTime, formatRupiah, formatTeamSize } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { currentFee } from "@/lib/pricing";
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

  const earlyRange = formatDateRange(EARLY_BIRD.startsOn, EARLY_BIRD.endsOn, lang);

  const items: CompetitionPickerItem[] = competitions.map((c) => {
    // Same price the registration form charges; the early bird only shows when it is actually cheaper.
    const fee = currentFee(c.fee, now);
    const discounted = fee < c.fee;
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
      earlyFee: discounted ? formatRupiah(fee, lang) : null,
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
