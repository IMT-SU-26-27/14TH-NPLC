import Link from "next/link";
import { CircleOffIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getActiveCompetitionBySlug, isRegistrationOpen } from "@/lib/data/competitions";
import { formatRupiah, formatTeamSize } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { publicImageUrl } from "@/lib/cloudinary/server";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { RegisterTeamForm } from "@/features/registration/components/register-team-form";
import type { RegisterSectionProps } from "@/types/registration";

export async function RegisterSection({ params }: RegisterSectionProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  const { slug } = await params;
  const [user, competition] = await Promise.all([requireUser(`/register/${slug}`), getActiveCompetitionBySlug(slug)]);

  if (!competition || !isRegistrationOpen(competition)) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleOffIcon />
          </EmptyMedia>
          <EmptyTitle>{competition ? t("register.closedTitle") : t("register.notFoundTitle")}</EmptyTitle>
          <EmptyDescription>{competition ? t("register.closedDescription") : t("register.notFoundDescription")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href={`${localePath(lang, "/")}#competitions`} className={buttonVariants({ variant: "outline" })}>
            {t("register.seeAll")}
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("register.title", { competition: competition.name })}</CardTitle>
        <CardDescription>
          {t("competition.teamOf", { size: formatTeamSize(competition.min_members, competition.max_members, lang) })} ·{" "}
          {formatRupiah(competition.fee, lang)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterTeamForm
          competition={competition}
          user={user}
          qrisUrl={competition.qris_public_id ? publicImageUrl(competition.qris_public_id) : null}
        />
      </CardContent>
    </Card>
  );
}
