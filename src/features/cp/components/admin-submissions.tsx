import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, FileCodeIcon, FlaskConicalIcon, XIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { getAdminSubmission, listAdminSubmissions, listCpCompetitions, listProblemOptions } from "@/lib/data/cp";
import { formatTimestamp } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { uuidSchema } from "@/lib/validations/admin";
import { submissionFiltersSchema } from "@/lib/validations/cp";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminSubmissionsTable } from "@/features/cp/components/admin-submissions-table";
import { SubmissionCodeViewer } from "@/features/cp/components/submission-code-viewer";
import { SubmissionFilters } from "@/features/cp/components/submission-filters";
import { VerdictBadge } from "@/features/cp/components/verdict-badge";
import type { AdminSubmissionPageProps, AdminSubmissionsSectionProps } from "@/types/cp";

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export async function AdminSubmissionsSection({ lang, searchParams }: AdminSubmissionsSectionProps) {
  const t = getT(lang);
  await requireAdmin();
  const [raw, competitions] = await Promise.all([searchParams, listCpCompetitions()]);
  const filters = submissionFiltersSchema.parse({
    competition: one(raw.competition),
    problem: one(raw.problem),
    team: one(raw.team),
    verdict: one(raw.verdict),
    q: one(raw.q) ?? "",
    page: one(raw.page),
  });
  const selected = competitions.find((c) => c.id === filters.competition) ?? competitions[0];

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

  const [problems, list] = await Promise.all([listProblemOptions(selected.id), listAdminSubmissions(selected.id, filters)]);
  const teamName = filters.team ? list.rows[0]?.team.team_name : null;

  return (
    <div className="space-y-4">
      {competitions.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {competitions.map((c) => (
            <Link
              key={c.id}
              href={`${localePath(lang, "/admin/cp/submissions")}?competition=${c.id}`}
              className={buttonVariants({ variant: c.id === selected.id ? "secondary" : "ghost", size: "sm" })}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
      {filters.team && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("admin.submissions.onlyTeam")}</span>
          <Badge variant="secondary">{teamName ?? t("admin.submissions.selectedTeam")}</Badge>
          <Link
            href={`${localePath(lang, "/admin/cp/submissions")}?competition=${selected.id}`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <XIcon />
            {t("admin.submissions.allTeams")}
          </Link>
        </div>
      )}
      <SubmissionFilters filters={filters} competitionId={selected.id} problems={problems} />
      <AdminSubmissionsTable list={list} filters={filters} competitionId={selected.id} lang={lang} />
    </div>
  );
}

export async function AdminSubmissionDetailSection({ params }: AdminSubmissionPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  await requireAdmin();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const s = await getAdminSubmission(id);
  if (!s) notFound();

  const facts = [
    { label: t("admin.submissions.team"), value: (
      <Link href={localePath(lang, `/admin/registrations/${s.team.id}`)} className="underline-offset-4 hover:underline">
        {s.team.team_name}
      </Link>
    ) },
    { label: t("admin.submissions.submittedBy"), value: s.submitter ? s.submitter.full_name || s.submitter.email : "—" },
    { label: t("admin.submissions.submitted"), value: formatTimestamp(s.created_at, lang) },
    { label: t("cp.language"), value: t(`cp.languages.${s.language}`) },
    { label: t("admin.submissions.tests"), value: `${s.passed}/${s.total}` },
    { label: t("admin.submissions.score"), value: `${Number(s.score).toFixed(2)} / ${s.problem.points}` },
    { label: t("admin.submissions.efficiency"), value: `${Math.round(Number(s.efficiency) * 100)}%` },
    {
      label: t("admin.submissions.slowest"),
      value: s.max_time_ms === null ? "—" : `${s.max_time_ms} / ${s.problem.time_limit_ms} ms`,
    },
    {
      label: t("admin.submissions.peakMemory"),
      value: s.max_memory_kb === null ? "—" : `${Math.round(s.max_memory_kb / 1024)} / ${Math.round(s.problem.memory_limit_kb / 1024)} MB`,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href={`${localePath(lang, "/admin/cp/submissions")}?competition=${s.problem.competition_id}`}
        className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2" })}
      >
        <ArrowLeftIcon />
        {t("admin.submissions.title")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {s.problem.level}. {s.problem.title}
          </h1>
          <p className="text-muted-foreground">
            {s.team.team_name} · <span className="font-mono text-xs">{s.id}</span>
          </p>
        </div>
        <VerdictBadge verdict={s.verdict} />
      </div>

      <Card>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="space-y-1">
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="font-medium tabular-nums">{f.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.submissions.code")}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <SubmissionCodeViewer code={s.source_code} language={s.language} />
        </CardContent>
      </Card>

      {s.compile_output && (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.submissions.compileOutput")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted max-h-80 overflow-auto rounded-lg p-3 font-mono text-xs whitespace-pre-wrap">{s.compile_output}</pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.submissions.results")}</CardTitle>
          <CardDescription>{t("admin.submissions.resultsLead")}</CardDescription>
        </CardHeader>
        <CardContent>
          {s.results.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FlaskConicalIcon />
                </EmptyMedia>
                <EmptyTitle>{t("admin.submissions.resultsGoneTitle")}</EmptyTitle>
                <EmptyDescription>{t("admin.submissions.resultsGoneDescription")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("admin.submissions.test")}</TableHead>
                  <TableHead>{t("admin.submissions.kind")}</TableHead>
                  <TableHead>{t("admin.submissions.verdict")}</TableHead>
                  <TableHead className="text-right">{t("admin.submissions.time")}</TableHead>
                  <TableHead className="text-right">{t("admin.submissions.memory")}</TableHead>
                  <TableHead>{t("admin.submissions.message")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {s.results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="tabular-nums">{r.test?.ordinal ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.test?.is_sample ? t("admin.submissions.sample") : t("admin.submissions.hidden")}</Badge>
                    </TableCell>
                    <TableCell>
                      <VerdictBadge verdict={r.verdict} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">{r.time_ms === null ? "—" : `${r.time_ms} ms`}</TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {r.memory_kb === null ? "—" : `${Math.round(r.memory_kb / 1024)} MB`}
                    </TableCell>
                    <TableCell className="max-w-80">
                      {r.message ? <span className="text-muted-foreground line-clamp-2 font-mono text-xs">{r.message}</span> : "—"}
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
