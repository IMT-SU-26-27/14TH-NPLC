import Link from "next/link";
import { OctagonXIcon, UsersIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getMyTeams, previewTeam } from "@/lib/data/registrations";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { referralCodeSchema } from "@/lib/validations/registration";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBand } from "@/components/shared/page-band";
import { JoinCodeForm } from "@/features/registration/components/join-code-form";
import { JoinTeamForm } from "@/features/registration/components/join-team-form";
import type { JoinSectionProps } from "@/types/registration";

const card = "ring-border rounded-xl py-6 sm:py-8";
const cardPadding = "px-5 sm:px-8";
const sectionLabel = "text-primary font-mono text-xs tracking-[0.2em] uppercase";

// Figma frames "10 // Gabung tim" (enter a code) and "11 // Gabung tim" (team found, fill in the form).
export async function JoinSection({ lang, searchParams }: JoinSectionProps) {
  const t = getT(lang);
  const { code } = await searchParams;
  const [user, [myTeam]] = await Promise.all([requireUser(code ? `/join?code=${encodeURIComponent(code)}` : "/join"), getMyTeams()]);

  const page = (found: boolean, children: React.ReactNode) => (
    <>
      <PageBand
        index={found ? "11" : "10"}
        label={t("join.title")}
        title={t("join.title")}
        lead={t(found ? "join.foundLead" : "join.lead")}
        mascot={{ src: "/shared/maskot-4.webp" }}
      />
      <div className={cn("mx-auto w-full space-y-6 px-4 py-12", found ? "max-w-2xl" : "max-w-xl")}>{children}</div>
    </>
  );

  if (myTeam) {
    return page(
      false,
      <Card className={card}>
        <CardHeader className={cardPadding}>
          <p className={sectionLabel}>{`// ${t("join.title")}`}</p>
        </CardHeader>
        <CardContent className={cn("space-y-6", cardPadding)}>
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertTitle>{t("join.alreadyTitle")}</AlertTitle>
            <AlertDescription>{t("join.alreadyDescription", { team: myTeam.team_name, competition: myTeam.competition.name })}</AlertDescription>
          </Alert>
          <Link href={localePath(lang, "/dashboard")} className={buttonVariants({ variant: "outline" })}>
            {t("join.toDashboard")}
          </Link>
        </CardContent>
      </Card>,
    );
  }

  const codeCard = (label: string, message?: string, primary = true) => (
    <Card className={card}>
      <CardHeader className={cardPadding}>
        <p className={sectionLabel}>{`// ${label}`}</p>
      </CardHeader>
      <CardContent className={cn("space-y-6", cardPadding)}>
        {message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <JoinCodeForm defaultCode={primary ? code : undefined} primary={primary} />
      </CardContent>
    </Card>
  );

  if (!code) return page(false, codeCard(t("join.code")));

  const parsed = referralCodeSchema.safeParse(code);
  if (!parsed.success) return page(false, codeCard(t("join.code"), t(parsed.error.issues[0].message)));

  const preview = await previewTeam(parsed.data);
  if (!preview) return page(false, codeCard(t("join.code"), t("join.notFound")));

  const full = preview.member_count >= preview.max_members;

  return page(
    true,
    <>
      <Card className={card}>
        <CardHeader className={cn("gap-2", cardPadding)}>
          <p className={sectionLabel}>{`// ${t("join.found")}`}</p>
          <CardTitle className="text-2xl font-bold sm:text-3xl">{preview.team_name}</CardTitle>
          <CardDescription>{t("join.ledBy", { competition: preview.competition_name, leader: preview.leader_name })}</CardDescription>
          <CardAction>
            <Badge variant="outline" className="font-mono">
              <UsersIcon />
              {preview.member_count}/{preview.max_members}
            </Badge>
          </CardAction>
          {/* One segment per seat: filled seats are taken. */}
          <div aria-hidden className="col-span-full mt-4 flex gap-1.5">
            {Array.from({ length: preview.max_members }, (_, seat) => (
              <span key={seat} className={cn("h-1.5 flex-1 rounded-full", seat < preview.member_count ? "bg-(image:--tagline-gradient)" : "bg-primary/30")} />
            ))}
          </div>
        </CardHeader>
        <CardContent className={cardPadding}>
          {!preview.is_joinable || full ? (
            <Alert variant="destructive">
              <OctagonXIcon />
              <AlertTitle>{full ? t("join.fullTitle") : t("join.closedTitle")}</AlertTitle>
              <AlertDescription>{full ? t("join.fullDescription") : t("join.closedDescription")}</AlertDescription>
            </Alert>
          ) : (
            <JoinTeamForm referralCode={parsed.data} preview={preview} user={user} />
          )}
        </CardContent>
      </Card>
      {codeCard(t("join.notThisTeam"), undefined, false)}
    </>,
  );
}
