import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { getCompetition } from "@/lib/data/admin";
import { publicImageUrl } from "@/lib/cloudinary/server";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { uuidSchema } from "@/lib/validations/admin";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDeleteButton } from "@/features/admin/components/admin-delete-button";
import { CompetitionForm } from "@/features/admin/components/competition-form";
import { QrisUploader } from "@/features/admin/components/qris-uploader";
import type { CompetitionEditSectionProps } from "@/types/admin";

// `id` is absent on /admin/competitions/new.
export async function CompetitionEditSection({ params }: CompetitionEditSectionProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  await requireAdmin();

  const { id } = await params;
  let competition = null;
  if (id) {
    if (!uuidSchema.safeParse(id).success) notFound();
    competition = await getCompetition(id);
    if (!competition) notFound();
  }

  return (
    <div className="space-y-6">
      <Link href={localePath(lang, "/admin/competitions")} className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2" })}>
        <ArrowLeftIcon />
        {t("admin.competitions.title")}
      </Link>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{competition ? competition.name : t("admin.competitions.new")}</CardTitle>
            <CardDescription>{competition ? t("admin.competitions.edit") : t("admin.competitions.lead")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CompetitionForm competition={competition} />
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.competitions.qris")}</CardTitle>
              {!competition && <CardDescription>{t("admin.competitions.qrisSaveFirst")}</CardDescription>}
            </CardHeader>
            {competition && (
              <CardContent>
                <QrisUploader
                  competitionId={competition.id}
                  qrisUrl={competition.qris_public_id ? publicImageUrl(competition.qris_public_id) : null}
                />
              </CardContent>
            )}
          </Card>
          {competition && (
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.detail.dangerZone")}</CardTitle>
                <CardDescription>{t("admin.competitions.deleteDescription")}</CardDescription>
              </CardHeader>
              <CardFooter>
                <AdminDeleteButton id={competition.id} label={t("admin.competitions.deleteCompetition")} target="competition" />
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
