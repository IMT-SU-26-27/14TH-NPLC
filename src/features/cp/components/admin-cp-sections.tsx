import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, FileCodeIcon, PlusIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { getAdminContest, getAdminProblem, listCpCompetitions } from "@/lib/data/cp";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { uuidSchema } from "@/lib/validations/admin";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContestControl } from "@/features/cp/components/contest-control";
import { DeleteProblemButton } from "@/features/cp/components/delete-problem-button";
import { ProblemForm } from "@/features/cp/components/problem-form";
import type { AdminCpSectionProps, AdminProblemPageProps } from "@/types/cp";

export async function AdminCpSection({ lang, searchParams }: AdminCpSectionProps) {
  const t = getT(lang);
  await requireAdmin();
  const [{ competition }, competitions] = await Promise.all([searchParams, listCpCompetitions()]);
  const selected = competitions.find((c) => c.id === competition) ?? competitions[0];

  if (!selected) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileCodeIcon />
          </EmptyMedia>
          <EmptyTitle>{t("admin.cp.noCompetition")}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }
  const contest = await getAdminContest(selected.id);
  if (!contest) notFound();

  return (
    <div className="space-y-6">
      {competitions.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {competitions.map((c) => (
            <Link
              key={c.id}
              href={`${localePath(lang, "/admin/cp")}?competition=${c.id}`}
              className={buttonVariants({ variant: c.id === selected.id ? "secondary" : "ghost", size: "sm" })}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
      <ContestControl contest={contest} />
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.cp.problems")}</CardTitle>
          <CardDescription>{t("admin.cp.problemsLead")}</CardDescription>
          <CardAction>
            <Link href={`${localePath(lang, "/admin/cp/problems/new")}?competition=${contest.competitionId}`} className={buttonVariants({ size: "sm" })}>
              <PlusIcon />
              {t("admin.cp.newProblem")}
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {contest.problems.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileCodeIcon />
                </EmptyMedia>
                <EmptyTitle>{t("admin.cp.emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("admin.cp.emptyDescription")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("admin.cp.form.level")}</TableHead>
                  <TableHead>{t("admin.cp.form.titleLabel")}</TableHead>
                  <TableHead className="text-right">{t("admin.cp.form.points")}</TableHead>
                  <TableHead>{t("admin.cp.form.testCases")}</TableHead>
                  <TableHead>{t("admin.registrations.status")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contest.problems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="tabular-nums">{p.level}</TableCell>
                    <TableCell>
                      <Link href={localePath(lang, `/admin/cp/problems/${p.id}`)} className="font-medium underline-offset-4 hover:underline">
                        {p.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{p.points}</TableCell>
                    <TableCell>{t("admin.cp.tests", { count: p.testCaseCount })}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_published ? "default" : "outline"}>{p.is_published ? t("admin.cp.published") : t("admin.cp.draft")}</Badge>
                    </TableCell>
                    <TableCell>
                      <DeleteProblemButton problemId={p.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// New problem (no id; competition from ?competition=) or edit an existing one.
export async function AdminProblemSection({ params, searchParams }: AdminProblemPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  await requireAdmin();
  const [{ id }, { competition }] = await Promise.all([params, searchParams]);

  let problem = null;
  let competitionId = competition;
  if (id) {
    if (!uuidSchema.safeParse(id).success) notFound();
    problem = await getAdminProblem(id);
    if (!problem) notFound();
    competitionId = problem.competition_id;
  }
  if (!competitionId || !uuidSchema.safeParse(competitionId).success) notFound();

  return (
    <div className="space-y-6">
      <Link href={`${localePath(lang, "/admin/cp")}?competition=${competitionId}`} className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2" })}>
        <ArrowLeftIcon />
        {t("admin.cp.title")}
      </Link>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{problem ? problem.title : t("admin.cp.newProblem")}</h1>
      <ProblemForm competitionId={competitionId} problem={problem} />
    </div>
  );
}
