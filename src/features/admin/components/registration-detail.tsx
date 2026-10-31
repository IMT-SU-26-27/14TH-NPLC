import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ListChecksIcon, ReceiptIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { getRegistrationDetail } from "@/lib/data/admin";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { privateAssetUrl } from "@/lib/cloudinary/server";
import Image from "next/image";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { uuidSchema } from "@/lib/validations/admin";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { RegistrationStatusBadge } from "@/features/registration/components/registration-status-badge";
import { TeamTimeline } from "@/features/dashboard/components/team-timeline";
import { AdminMembersTable } from "@/features/admin/components/admin-members-table";
import { AdminTwibbonProofs } from "@/features/admin/components/admin-twibbon-proofs";
import { AdminDeleteButton } from "@/features/admin/components/admin-delete-button";
import { PaymentProofButton } from "@/features/admin/components/payment-proof-button";
import { ReviewForm } from "@/features/admin/components/review-form";
import { TeamNameForm } from "@/features/admin/components/team-name-form";
import type { AdminIdSectionProps } from "@/types/admin";

export async function RegistrationDetail({ params }: AdminIdSectionProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  await requireAdmin();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const team = await getRegistrationDetail(id);
  if (!team) notFound();

  return (
    <div className="space-y-6">
      <Link href={localePath(lang, "/admin/registrations")} className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2" })}>
        <ArrowLeftIcon />
        {t("admin.detail.back")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{team.team_name}</h1>
          <p className="text-muted-foreground">
            {team.competition.name} · {t("admin.detail.code")} <span className="font-mono">{team.referral_code}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {team.competition.type === "competitive_programming" && team.status === "accepted" && (
            <Link
              href={`${localePath(lang, "/admin/cp/submissions")}?competition=${team.competition.id}&team=${team.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ListChecksIcon />
              {t("admin.submissions.viewTeam")}
            </Link>
          )}
          <RegistrationStatusBadge status={team.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("admin.detail.members")} ({team.members.length}/{team.competition.max_members})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">{t("register.school")}</dt>
                  <dd className="font-medium">{team.school ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("register.lineId")}</dt>
                  <dd className="font-mono font-medium">{team.line_id ?? "—"}</dd>
                </div>
              </dl>
              <AdminMembersTable team={team} />
              <TeamNameForm registrationId={team.id} teamName={team.team_name} />
            </CardContent>
          </Card>
          <AdminTwibbonProofs team={team} lang={lang} />
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.progress")}</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamTimeline team={team} lang={lang} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.detail.review")}</CardTitle>
              <CardDescription>{t("admin.detail.reviewLead")}</CardDescription>
              <CardAction>
                <ReceiptIcon className="text-muted-foreground size-4" />
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t("payment.amount")}</dt>
                  <dd className="font-medium">{formatRupiah(team.competition.fee, lang)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("admin.registrations.paymentSubmitted")}</dt>
                  <dd className="font-medium">{formatDateTime(team.payment_submitted_at, lang)}</dd>
                </div>
              </dl>
              {team.payment_proof_public_id ? (
                <div className="space-y-3">
                  {team.payment_proof_format !== "pdf" && (
                    // Short-lived signed link; the admin check above runs before it is created.
                    <Image
                      src={privateAssetUrl(team.payment_proof_public_id, team.payment_proof_format ?? "png")}
                      alt={t("admin.detail.viewProof")}
                      width={640}
                      height={640}
                      unoptimized
                      className="bg-muted max-h-96 w-full rounded-lg border object-contain"
                    />
                  )}
                  <PaymentProofButton registrationId={team.id} />
                </div>
              ) : (
                <Empty className="border p-4">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ReceiptIcon />
                    </EmptyMedia>
                    <EmptyTitle>{t("admin.detail.noProof")}</EmptyTitle>
                    <EmptyDescription>{t("admin.detail.notSubmitted")}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              <ReviewForm registrationId={team.id} status={team.status} rejectionReason={team.rejection_reason} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.detail.dangerZone")}</CardTitle>
              <CardDescription>{t("admin.detail.deleteDescription")}</CardDescription>
            </CardHeader>
            <CardFooter>
              <AdminDeleteButton id={team.id} label={t("admin.detail.deleteRegistration")} target="registration" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
