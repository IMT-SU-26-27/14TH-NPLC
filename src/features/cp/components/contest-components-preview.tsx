import { connection } from "next/server";
import { CircleAlertIcon, InboxIcon, LockIcon, OctagonXIcon, PlayIcon, SendIcon, TriangleAlertIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/lib/data/auth";
import { formatMegabytes, formatSeconds, formatSignedScore } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { PREVIEW_PENALTY, panelStateFixtures, previewNow, previewSession } from "@/lib/cp/preview-fixtures";
import { problemLetter } from "@/lib/cp/problem-letter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContestBar } from "@/features/cp/components/contest-bar";
import { ContestTimer } from "@/features/cp/components/contest-timer";
import { LeaderboardLegend } from "@/features/cp/components/leaderboard-legend";
import { LeaderboardProblemCell } from "@/features/cp/components/leaderboard-problem-cell";
import { ProblemStatusBadge } from "@/features/cp/components/problem-status-badge";
import { ScoreDelta } from "@/features/cp/components/score-delta";
import { VerdictBadge } from "@/features/cp/components/verdict-badge";
import type { ContestBarView, ContestComponentsPreviewProps, ContestContext, CpSession, LeaderboardCellSize, ProblemStatus, VerdictBadgeKind } from "@/types/cp";

const KINDS: VerdictBadgeKind[] = ["accepted", "solved", "wrongAnswer", "runtimeError", "timeLimit", "compileError", "judgeError", "judging", "run", "lateRejected"];
const SCORE_FOR: Partial<Record<VerdictBadgeKind, number>> = {
  accepted: 100,
  solved: 0,
  wrongAnswer: -PREVIEW_PENALTY,
  runtimeError: -PREVIEW_PENALTY,
  timeLimit: -PREVIEW_PENALTY,
  compileError: -PREVIEW_PENALTY,
};
const CELL_SIZES: LeaderboardCellSize[] = ["sm", "default", "lg"];
const CELL_STATES: (ProblemStatus | null)[] = [{ solved: true, wrong: 0 }, { solved: true, wrong: 2 }, { solved: false, wrong: 3 }, null];
const BOARD_ROWS = [
  { team: "Null Pointer", school: "SMK Contoh 5", score: 470, runtimeMs: 1300, memoryKb: 71885, you: false, cells: [{ solved: true, wrong: 1 }, { solved: true, wrong: 2 }, null, null] },
  { team: "Byte Squad", school: "SMA Contoh 1", score: 250, runtimeMs: 340, memoryKb: 26522, you: true, cells: [{ solved: true, wrong: 2 }, { solved: false, wrong: 1 }, null, null] },
  { team: "Graf Gerilya", school: "SMK Contoh 1", score: 50, runtimeMs: 90, memoryKb: 3994, you: false, cells: [{ solved: true, wrong: 3 }, { solved: false, wrong: 2 }, null, null] },
  { team: "Heap Heroes", school: "SMA Contoh 13", score: -10, runtimeMs: 0, memoryKb: 0, you: false, cells: [{ solved: false, wrong: 1 }, null, null, null] },
];

// Internal page for the team building the contest screens: every state of the shared components, with example
// data, so they can be matched against Figma without opening the canvas.
export async function ContestComponentsPreview({ lang }: ContestComponentsPreviewProps) {
  await requireAdmin();
  await connection();
  const t = getT(lang);
  const now = previewNow();
  const hour = 3_600_000;

  const context = (session: CpSession): ContestContext => ({
    competitionId: session.competition_id,
    registrationId: "00000000-0000-4000-8000-000000000003",
    teamName: "Byte Squad",
    session,
    autoFreezeAt: null,
  });
  const live = previewSession(now, {});
  const bars: { id: string; view: ContestBarView; session: CpSession; disqualified?: boolean }[] = [
    { id: "live · problem", view: "problem", session: live },
    { id: "live · leaderboard closed", view: "leaderboard", session: { ...live, leaderboard_frozen_at: new Date(now).toISOString() } },
    { id: "paused · waiting", view: "waiting", session: { ...live, status: "paused", paused_at: new Date(now - 0.1 * hour).toISOString() } },
    { id: "ended · waiting", view: "waiting", session: { ...live, status: "ended", ended_at: new Date(now).toISOString() } },
    {
      id: "scheduled · waiting",
      view: "waiting",
      session: { ...live, status: "scheduled", scheduled_start_at: new Date(now + 2 * hour).toISOString(), started_at: null },
    },
    { id: "unscheduled · waiting", view: "waiting", session: { ...live, status: "scheduled", scheduled_start_at: null, started_at: null } },
    { id: "disqualified · problem", view: "problem", session: live, disqualified: true },
  ];

  const section = "space-y-3";
  const heading = "font-heading text-lg font-semibold";
  const lead = "text-muted-foreground max-w-3xl text-sm";
  const code = "text-muted-foreground font-mono text-xs";

  return (
    <div className="space-y-10">
      <section className={section}>
        <h2 className={heading}>{t("admin.cpComponents.bar")}</h2>
        <p className={lead}>{t("admin.cpComponents.barLead")}</p>
        <div className="space-y-4">
          {bars.map((bar) => (
            <div key={bar.id} className="space-y-1.5">
              <p className={code}>{bar.id}</p>
              <div className="overflow-hidden rounded-xl border">
                <ContestBar lang={lang} context={context(bar.session)} view={bar.view} disqualified={bar.disqualified} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>{t("admin.cpComponents.verdict")}</h2>
        <p className={lead}>{t("admin.cpComponents.verdictLead", { penalty: PREVIEW_PENALTY })}</p>
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>kind</TableHead>
                <TableHead>VerdictBadge</TableHead>
                <TableHead>ScoreDelta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {KINDS.map((kind) => (
                <TableRow key={kind}>
                  <TableCell className={code}>{kind}</TableCell>
                  <TableCell>
                    <VerdictBadge kind={kind} />
                  </TableCell>
                  <TableCell>
                    <ScoreDelta score={SCORE_FOR[kind] ?? null} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section className={section}>
        <h2 className={heading}>{t("admin.cpComponents.buttons")}</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex gap-2">
            <Button variant="outline">
              <PlayIcon />
              {t("cp.contest.code.run")}
            </Button>
            <Button>
              <SendIcon />
              {t("cp.contest.code.submit")}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <PlayIcon />
              {t("cp.contest.code.run")}
            </Button>
            <Button disabled>
              <Spinner />
              {t("cp.contest.code.sending")}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">{t("cp.contest.code.cooldown", { seconds: 15 })}</span>
            <Button variant="outline">
              <PlayIcon />
              {t("cp.contest.code.run")}
            </Button>
            <Button disabled className="font-mono tabular-nums">
              {t("cp.contest.code.cooldownButton", { time: "0:12" })}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <PlayIcon />
              {t("cp.contest.code.run")}
            </Button>
            <Button disabled>
              <SendIcon />
              {t("cp.contest.code.submit")}
            </Button>
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>{t("admin.cpComponents.panel")}</h2>
        <p className={lead}>{t("admin.cpComponents.panelLead")}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {panelStateFixtures(lang).map((state) => {
            const [first, ...rest] = state.notes;
            return (
              <Card key={state.id} size="sm">
                <CardHeader className="space-y-2">
                  <p className={code}>{state.id}</p>
                  {state.kind && (
                    <div className="flex flex-wrap items-center gap-2">
                      <VerdictBadge kind={state.kind} />
                      <ScoreDelta score={state.score} />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {state.passed !== undefined && state.total !== undefined && state.kind !== "run" && (
                    <p className="font-mono text-xs tabular-nums">
                      {t("cp.contest.panel.passed", { passed: state.passed, total: state.total })}
                      {state.maxTimeMs !== undefined &&
                        ` · ${t("cp.contest.panel.runtime")} ${formatSeconds(state.maxTimeMs, lang)} ${t("cp.contest.units.seconds")}`}
                      {state.maxMemoryKb !== undefined &&
                        ` · ${t("cp.contest.panel.memory")} ${formatMegabytes(state.maxMemoryKb, lang)} ${t("cp.contest.units.megabytes")}`}
                    </p>
                  )}
                  {state.id === "empty" ? (
                    <Empty className="border py-6">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <InboxIcon />
                        </EmptyMedia>
                        <EmptyTitle>{t(first.key)}</EmptyTitle>
                        <EmptyDescription>{rest[0] && t(rest[0].key)}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : state.alert ? (
                    <Alert
                      variant={state.alert === "destructive" ? "destructive" : "default"}
                      className={state.alert === "warning" ? "border-warning-border [&>svg]:text-warning" : undefined}
                    >
                      {state.alert === "destructive" ? <OctagonXIcon /> : state.alert === "warning" ? <TriangleAlertIcon /> : <CircleAlertIcon />}
                      {rest.length > 0 ? (
                        <>
                          <AlertTitle>{t(first.key, first.params)}</AlertTitle>
                          <AlertDescription>{rest.map((note) => t(note.key, note.params)).join(" ")}</AlertDescription>
                        </>
                      ) : (
                        <AlertDescription>{t(first.key, first.params)}</AlertDescription>
                      )}
                    </Alert>
                  ) : (
                    <p className="text-muted-foreground">{state.notes.map((note) => t(note.key, note.params)).join(" ")}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>{t("admin.cpComponents.problemStatus")}</h2>
        <div className="flex flex-wrap gap-3">
          <ProblemStatusBadge status={{ solved: true, wrong: 1 }} />
          <ProblemStatusBadge status={{ solved: false, wrong: 2 }} />
          <ProblemStatusBadge status={null} />
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>{t("admin.cpComponents.cells")}</h2>
        <p className={lead}>{t("admin.cpComponents.cellsLead")}</p>
        <div className="space-y-4">
          {CELL_SIZES.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              <span className={cn(code, "w-16")}>{size}</span>
              {CELL_STATES.map((status, i) => (
                <LeaderboardProblemCell key={i} status={status} size={size} />
              ))}
            </div>
          ))}
          <LeaderboardLegend />
          <LeaderboardLegend size="lg" />
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>{t("admin.cpComponents.board")}</h2>
        <p className={lead}>{t("admin.cpComponents.boardLead")}</p>
        <Alert>
          <LockIcon />
          <AlertTitle>{t("cp.contest.board.closedTitle")}</AlertTitle>
          <AlertDescription>{t("cp.contest.board.closedLead")}</AlertDescription>
        </Alert>
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">{t("cp.contest.board.colRank")}</TableHead>
                <TableHead>{t("cp.contest.board.colTeam")}</TableHead>
                <TableHead>{t("cp.contest.board.colSchool")}</TableHead>
                <TableHead className="text-right">{t("cp.contest.board.colScore")}</TableHead>
                <TableHead className="text-right">{t("cp.contest.board.colRuntime")}</TableHead>
                <TableHead className="text-right">{t("cp.contest.board.colMemory")}</TableHead>
                {[0, 1, 2, 3].map((i) => (
                  <TableHead key={i} className="text-center font-mono">
                    {problemLetter(i)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {BOARD_ROWS.map((row, index) => (
                <TableRow key={row.team} className={row.you ? "bg-accent hover:bg-accent" : undefined}>
                  <TableCell className="font-mono tabular-nums">{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      {row.team}
                      {row.you && <Badge>{t("cp.contest.board.yourTeam")}</Badge>}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.school}</TableCell>
                  <TableCell className={cn("text-right font-mono font-semibold tabular-nums", row.score < 0 && "text-destructive")}>
                    {formatSignedScore(row.score, lang)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatSeconds(row.runtimeMs, lang)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatMegabytes(row.memoryKb, lang)}</TableCell>
                  {row.cells.map((status, i) => (
                    <TableCell key={i} className="text-center">
                      <LeaderboardProblemCell status={status} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <LeaderboardLegend />
      </section>

      <section className={section}>
        <h2 className={heading}>{t("admin.cpComponents.bigTimer")}</h2>
        <div className="flex flex-wrap gap-10">
          <ContestTimer
            competitionId={live.competition_id}
            status="live"
            scheduledStartAt={live.scheduled_start_at}
            endsAt={live.scheduled_end_at}
            pausedAt={null}
            size="lg"
            finishAtZero={false}
          />
          <ContestTimer
            competitionId={live.competition_id}
            status="paused"
            scheduledStartAt={live.scheduled_start_at}
            endsAt={live.scheduled_end_at}
            pausedAt={new Date(now - 0.1 * hour).toISOString()}
            size="lg"
            finishAtZero={false}
          />
        </div>
      </section>
    </div>
  );
}
