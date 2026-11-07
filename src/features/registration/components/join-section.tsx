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
import { Separator } from "@/components/ui/separator";
import { JoinCodeForm } from "@/features/registration/components/join-code-form";
import { JoinTeamForm } from "@/features/registration/components/join-team-form";
import type { JoinSectionProps } from "@/types/registration";

const card = "ring-border rounded-xl py-6 sm:py-8";
const cardPadding = "px-5 sm:px-8";
const sectionLabel = "text-primary font-mono text-xs tracking-[0.2em] uppercase";

export async function JoinSection({ lang, searchParams }: JoinSectionProps) {
  const t = getT(lang);
  const { code } = await searchParams;
  const [user, [myTeam]] = await Promise.all([requireUser(code ? `/join?code=${encodeURIComponent(code)}` : "/join"), getMyTeams()]);

  if (myTeam) {
    return (
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
      </Card>
    );
  }

  const codeCard = (message?: string) => (
    <Card className={card}>
      <CardHeader className={cardPadding}>
        <p className={sectionLabel}>{`// ${t("join.code")}`}</p>
      </CardHeader>
      <CardContent className={cn("space-y-6", cardPadding)}>
        {message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <JoinCodeForm defaultCode={code} />
      </CardContent>
    </Card>
  );

  if (!code) return codeCard();

  const parsed = referralCodeSchema.safeParse(code);
  if (!parsed.success) return codeCard(t(parsed.error.issues[0].message));

  const preview = await previewTeam(parsed.data);
  if (!preview) return codeCard(t("join.notFound"));

  const full = preview.member_count >= preview.max_members;

  return (
    <Card className={card}>
      <CardHeader className={cn("gap-2", cardPadding)}>
        <p className={sectionLabel}>{`// ${t("join.found")}`}</p>
        <CardTitle className="text-xl">{preview.team_name}</CardTitle>
        <CardDescription>{t("join.ledBy", { competition: preview.competition_name, leader: preview.leader_name })}</CardDescription>
        <CardAction>
          <Badge variant="secondary">
            <UsersIcon />
            {preview.member_count}/{preview.max_members}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className={cn("space-y-6", cardPadding)}>
        {!preview.is_joinable || full ? (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertTitle>{full ? t("join.fullTitle") : t("join.closedTitle")}</AlertTitle>
            <AlertDescription>{full ? t("join.fullDescription") : t("join.closedDescription")}</AlertDescription>
          </Alert>
        ) : (
          <JoinTeamForm referralCode={parsed.data} preview={preview} user={user} />
        )}
        <Separator />
        <JoinCodeForm primary={false} />
      </CardContent>
    </Card>
  );
}
