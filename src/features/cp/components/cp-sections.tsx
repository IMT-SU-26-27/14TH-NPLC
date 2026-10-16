import { notFound } from "next/navigation";
import { CodeIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getContestContext, getLeaderboard, getProblemView, getRecentSubmissions, listContestProblems } from "@/lib/data/cp";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { uuidSchema } from "@/lib/validations/admin";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ContestHeader } from "@/features/cp/components/contest-header";
import { ContestLiveGuard } from "@/features/cp/components/contest-live-guard";
import { LeaderboardTable } from "@/features/cp/components/leaderboard-table";
import { ProblemList } from "@/features/cp/components/problem-list";
import { ProblemStatement } from "@/features/cp/components/problem-statement";
import { ProblemWorkspace } from "@/features/cp/components/problem-workspace";
import { WaitingRoom } from "@/features/cp/components/waiting-room";
import type { CpProblemPageProps } from "@/types/cp";
import type { LangProps } from "@/types/i18n";

// The proxy already limits /cp to accepted CP teams (and admins) and to the right contest state.
async function loadContext(lang: LangProps["lang"]) {
  const user = await requireUser("/cp");
  const context = await getContestContext(user.role === "admin");
  const t = getT(lang);
  const empty = (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CodeIcon />
        </EmptyMedia>
        <EmptyTitle>{t("dashboard.cpNoticeTitle")}</EmptyTitle>
        <EmptyDescription>{t("dashboard.cpNoticeDescription")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
  return { user, context, empty };
}

export async function ContestHome({ lang }: LangProps) {
  const { user, context, empty } = await loadContext(lang);
  if (!context) return empty;
  const problems = await listContestProblems(context.competitionId, context.registrationId);
  const t = getT(lang);

  return (
    <div className="space-y-6">
      <ContestHeader lang={lang} context={context} />
      {user.role !== "admin" && <ContestLiveGuard competitionId={context.competitionId} status={context.session.status} />}
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold">{t("cp.problems")}</h2>
          <p className="text-muted-foreground text-sm">{t("cp.problemsLead")}</p>
        </div>
        <ProblemList problems={problems} lang={lang} />
      </section>
    </div>
  );
}

export async function ContestWaiting({ lang }: LangProps) {
  const { context, empty } = await loadContext(lang);
  if (!context) return empty;
  return (
    <WaitingRoom
      competitionId={context.competitionId}
      status={context.session.status}
      scheduledStartAt={context.session.scheduled_start_at}
      durationSeconds={context.session.duration_seconds}
      teamName={context.teamName}
    />
  );
}

export async function ContestLeaderboard({ lang }: LangProps) {
  const { user, context, empty } = await loadContext(lang);
  if (!context) return empty;
  const viewer = user.role === "admin" ? "admin" : "participant";
  const frozenAt = context.session.leaderboard_frozen_at;
  // Participants see the snapshot while frozen; admins always see live scores.
  const rows = await getLeaderboard(context.competitionId, viewer === "participant" && frozenAt ? "snapshot" : "live");
  return (
    <LeaderboardTable
      key={frozenAt ?? "live"}
      initialRows={rows}
      competitionId={context.competitionId}
      highlightRegistrationId={context.registrationId}
      viewer={viewer}
      frozenAt={frozenAt}
    />
  );
}

export async function ContestProblem({ params }: CpProblemPageProps) {
  const lang = await resolveLang(params);
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const { user, context, empty } = await loadContext(lang);
  if (!context) return empty;
  const problem = await getProblemView(id);
  if (!problem) notFound();
  const recent = context.registrationId ? await getRecentSubmissions(problem.id, context.registrationId) : [];

  return (
    <div className="space-y-6">
      <ContestHeader lang={lang} context={context} showBackToProblems />
      {user.role !== "admin" && <ContestLiveGuard competitionId={context.competitionId} status={context.session.status} />}
      <ProblemWorkspace
        problemId={problem.id}
        statement={<ProblemStatement problem={problem} lang={lang} />}
        recent={recent}
        cooldownSeconds={context.session.submission_cooldown_seconds}
      />
    </div>
  );
}
