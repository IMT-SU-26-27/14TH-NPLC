import Link from "next/link";
import { ArrowRightIcon, ClockIcon, CodeXmlIcon, NetworkIcon, UsersIcon, WalletIcon } from "lucide-react";
import { competitionDescription, formatDateTime, formatTeamSize } from "@/lib/format";
import { isRegistrationOpen } from "@/lib/data/competitions";
import { localePath } from "@/lib/i18n/config";
import { currentFee } from "@/lib/pricing";
import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FeeAmount } from "@/components/shared/fee-amount";
import type { CompetitionCardProps } from "@/types/competition";

const microLabel = "text-primary flex items-center gap-1.5 font-mono text-xs tracking-[0.2em] uppercase";

// Figma "08 // Daftar tim" card: numbered name, open badge, members and fee side by side, deadline and CTA.
export function CompetitionCard({ competition, lang, index, full }: CompetitionCardProps) {
  const t = getT(lang);
  const open = isRegistrationOpen(competition);
  const category = t(`competition.category.${competition.type}`);
  const isCp = competition.type === "competitive_programming";
  const Icon = isCp ? CodeXmlIcon : NetworkIcon;
  const extraMin = Math.max(competition.min_members - 1, 0);
  const extraMax = Math.max(competition.max_members - 1, 0);
  const range = extraMin === extraMax ? `${extraMax}` : `${extraMin}–${extraMax}`;

  return (
    <Card className="ring-border h-full gap-6 rounded-xl py-6 sm:py-8">
      <CardHeader className="gap-3 px-6 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">{`${String(index + 1).padStart(2, "0")} // ${competition.name}`}</p>
          <Badge variant="outline" className="shrink-0 font-mono text-xs tracking-[0.15em] uppercase">
            <span
              aria-hidden
              className={cn("size-2 rounded-full", !open ? "bg-muted-foreground" : full ? "bg-destructive" : "bg-highlight ring-highlight-foreground/40 ring-1")}
            />
            {!open ? t("competition.closed") : full ? t("competition.quotaFullBadge") : t("competition.open")}
          </Badge>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold sm:text-3xl">{competition.name}</h2>
            <p className="text-muted-foreground text-sm">{category}</p>
          </div>
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full",
              isCp ? "bg-primary text-primary-foreground" : "bg-highlight text-highlight-foreground",
            )}
          >
            <Icon aria-hidden className="size-5" />
          </span>
        </div>
        {/* Three lines tall on desktop, so the members/fee rows of both cards line up. */}
        <p className="text-muted-foreground md:min-h-[3lh]">{competitionDescription(competition, lang)}</p>
      </CardHeader>

      <CardContent className="mx-6 grid grid-cols-2 border-y px-0 sm:mx-8">
        <div className="space-y-1 py-4 pr-4">
          <p className={microLabel}>
            <UsersIcon aria-hidden className="size-3.5" />
            {t("competition.members")}
          </p>
          <p className="font-heading text-xl font-bold sm:text-2xl">{formatTeamSize(competition.min_members, competition.max_members, lang)}</p>
          <p className="text-muted-foreground text-sm">
            {extraMax === 0 ? t("competition.leaderOnly") : t("competition.leaderPlus", { range })}
          </p>
        </div>
        <div className="space-y-1 border-l py-4 pl-4">
          <p className={microLabel}>
            <WalletIcon aria-hidden className="size-3.5" />
            {t("competition.fee")}
          </p>
          <p>
            <FeeAmount
              fee={currentFee(competition.fee)}
              normalFee={competition.fee}
              lang={lang}
              labels={{ normal: t("competition.normalPrice"), early: t("competition.earlyPrice") }}
              className="font-heading text-xl font-bold sm:text-2xl"
            />
          </p>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex-col items-start gap-4 border-t-0 bg-transparent px-6 pt-0 pb-6 sm:px-8 sm:pb-8">
        {competition.registration_closes_at && (
          <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase">
            <ClockIcon aria-hidden className="size-3.5" />
            {t("competition.closes", { date: formatDateTime(competition.registration_closes_at, lang) })}
          </p>
        )}
        {open && !full ? (
          <Link
            href={localePath(lang, `/register/${competition.slug}`)}
            className={cn(buttonVariants({ size: "lg" }), "bg-highlight text-highlight-foreground hover:bg-highlight/80 h-11 px-5")}
          >
            {t("competition.registerTeam")}
            <ArrowRightIcon />
          </Link>
        ) : (
          <span aria-disabled className={cn(buttonVariants({ variant: "outline", size: "lg" }), "pointer-events-none h-11 opacity-60")}>
            {open ? t("competition.quotaFull") : t("competition.registrationClosed")}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
