import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleOffIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getActiveCompetitionBySlug, isRegistrationOpen } from "@/lib/data/competitions";
import { hasRegistration } from "@/lib/data/registrations";
import { formatRupiah, formatTeamSize } from "@/lib/format";
import { currentFee } from "@/lib/pricing";
import { localePath } from "@/lib/i18n/config";
import { publicImageUrl } from "@/lib/cloudinary/server";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { PageBand } from "@/components/shared/page-band";
import { RegisterSteps } from "@/features/registration/components/register-steps";
import { RegisterSummary } from "@/features/registration/components/register-summary";
import { RegisterTeamForm } from "@/features/registration/components/register-team-form";
import type { RegisterSectionProps } from "@/types/registration";

export async function RegisterSection({ params }: RegisterSectionProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  const { slug } = await params;
  const [user, competition] = await Promise.all([requireUser(`/register/${slug}`), getActiveCompetitionBySlug(slug)]);
  if (await hasRegistration(user.id)) redirect(`${localePath(lang, "/dashboard")}?notice=already-registered`);

  if (!competition || !isRegistrationOpen(competition)) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <Empty className="bg-card border">
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
      </div>
    );
  }

  const size = formatTeamSize(competition.min_members, competition.max_members, lang);
  const fee = currentFee(competition.fee);

  return (
    <>
      <PageBand
        index="09"
        label={t("register.formLabel")}
        title={t("register.title", { competition: competition.name })}
        lead={`${size} · ${formatRupiah(fee, lang)}`}
      />
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 px-4 py-12 lg:grid-cols-[11rem_minmax(0,1fr)_17rem]">
        <RegisterSteps />
        <Card className="ring-border rounded-xl py-6 sm:py-8">
          <CardContent className="px-5 sm:px-8">
            <RegisterTeamForm
              competition={competition}
              user={user}
              fee={fee}
              qrisUrl={competition.qris_public_id ? publicImageUrl(competition.qris_public_id) : null}
            />
          </CardContent>
        </Card>
        <div className="max-lg:hidden lg:sticky lg:top-20">
          <RegisterSummary competition={competition} lang={lang} fee={fee} />
        </div>
      </div>
    </>
  );
}
