"use client";

import { useActionState, useEffect } from "react";
import { PauseIcon, PlayIcon, RotateCcwIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";
import { setContestStatus, updateSessionSettings } from "@/lib/actions/admin-cp";
import { initialFormState } from "@/lib/form";
import { formatDateTime, toWibInputValue } from "@/lib/format";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import { useI18n } from "@/hooks/use-i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ContestClock } from "@/features/cp/components/contest-clock";
import type { ContestControlProps, ContestTransition, ContestTransitionButtonProps } from "@/types/cp";

const STATUS_BADGE = {
  scheduled: { variant: "outline", className: undefined },
  live: { variant: "default", className: undefined },
  paused: { variant: "outline", className: "border-warning text-warning" },
  ended: { variant: "secondary", className: undefined },
} as const;

function ContestTransitionButton({ competitionId, transition: tr }: ContestTransitionButtonProps) {
  const { t } = useI18n();
  const confirm = useConfirmAction();
  return (
    <AlertDialog open={confirm.open} onOpenChange={confirm.setOpen}>
      <AlertDialogTrigger render={<Button variant={tr.destructive ? "destructive" : tr.to === "live" ? "default" : "outline"} />}>
        <tr.icon />
        {tr.label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tr.title}</AlertDialogTitle>
          <AlertDialogDescription>{tr.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirm.pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant={tr.destructive ? "destructive" : "default"}
            disabled={confirm.pending}
            onClick={() => confirm.run(() => setContestStatus(competitionId, tr.to), "admin.cp.started")}
          >
            {confirm.pending && <Spinner />}
            {tr.label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ContestControl({ contest }: ContestControlProps) {
  const { t, lang, fieldErrors } = useI18n();
  const { session } = contest;
  const duration = session.duration_seconds ?? 0;
  const [state, action, pending] = useActionState(updateSessionSettings, initialFormState);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(t(state.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast once per action result
  }, [state]);

  const start: ContestTransition = { to: "live", label: t("admin.cp.start"), title: t("admin.cp.startTitle"), description: t("admin.cp.startDescription"), icon: PlayIcon };
  const pause: ContestTransition = { to: "paused", label: t("admin.cp.pause"), title: t("admin.cp.pauseTitle"), description: t("admin.cp.pauseDescription"), icon: PauseIcon };
  const resume: ContestTransition = { to: "live", label: t("admin.cp.resume"), title: t("admin.cp.resumeTitle"), description: t("admin.cp.resumeDescription"), icon: PlayIcon };
  const end: ContestTransition = { to: "ended", label: t("admin.cp.end"), title: t("admin.cp.endTitle"), description: t("admin.cp.endDescription"), icon: SquareIcon, destructive: true };
  const reset: ContestTransition = { to: "scheduled", label: t("admin.cp.reset"), title: t("admin.cp.resetTitle"), description: t("admin.cp.resetDescription"), icon: RotateCcwIcon };
  const transitions = { scheduled: [start], live: [pause, end], paused: [resume, end], ended: [start, reset] }[session.status];
  const badge = STATUS_BADGE[session.status];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.cp.control")}</CardTitle>
        <CardDescription>{t("admin.cp.controlLead")}</CardDescription>
        <CardAction>
          <Badge variant={badge.variant} className={badge.className}>{t(`cp.${session.status}`)}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {transitions.map((tr) => (
            <ContestTransitionButton key={tr.to} competitionId={contest.competitionId} transition={tr} />
          ))}
          {(session.status === "live" || session.status === "paused") && (
            <ContestClock competitionId={contest.competitionId} status={session.status} endsAt={session.scheduled_end_at} pausedAt={session.paused_at} />
          )}
          <p className="text-muted-foreground text-sm">
            {session.started_at && t("admin.cp.startedAt", { date: formatDateTime(session.started_at, lang) })}
            {session.paused_at && ` · ${t("admin.cp.pausedAt", { date: formatDateTime(session.paused_at, lang) })}`}
            {session.paused_seconds > 0 && ` · ${t("admin.cp.pausedTotal", { minutes: Math.ceil(session.paused_seconds / 60) })}`}
            {session.ended_at && ` · ${t("admin.cp.endedAt", { date: formatDateTime(session.ended_at, lang) })}`}
          </p>
        </div>

        <Separator />

        <form action={action}>
          <input type="hidden" name="competitionId" value={contest.competitionId} />
          <FieldGroup>
            <div className="grid gap-6 md:grid-cols-3">
              <Field data-invalid={!!errors.scheduledStartAt}>
                <FieldLabel htmlFor="scheduledStartAt">{t("admin.cp.scheduledStart")}</FieldLabel>
                <Input id="scheduledStartAt" name="scheduledStartAt" type="datetime-local" defaultValue={toWibInputValue(session.scheduled_start_at)} />
                <FieldDescription>{t("admin.cp.scheduleHint")}</FieldDescription>
                <FieldError errors={fieldErrors(errors.scheduledStartAt)} />
              </Field>
              <Field data-invalid={!!errors.duration}>
                <FieldLabel htmlFor="durationHours">{t("admin.cp.duration")}</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["durationHours", t("admin.cp.hours"), 48, Math.floor(duration / 3600)],
                      ["durationMinutes", t("admin.cp.minutes"), 59, Math.floor((duration % 3600) / 60)],
                      ["durationSeconds", t("admin.cp.seconds"), 59, duration % 60],
                    ] as const
                  ).map(([name, unit, max, value]) => (
                    <div key={name} className="space-y-1">
                      <Input
                        id={name}
                        name={name}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={max}
                        defaultValue={value}
                        aria-label={unit}
                        aria-invalid={!!errors.duration}
                        className="tabular-nums"
                      />
                      <span className="text-muted-foreground block text-xs">{unit}</span>
                    </div>
                  ))}
                </div>
                <FieldDescription>{t("admin.cp.durationHint")}</FieldDescription>
                <FieldError errors={fieldErrors(errors.duration)} />
              </Field>
              <Field data-invalid={!!errors.cooldownSeconds}>
                <FieldLabel htmlFor="cooldownSeconds">{t("admin.cp.cooldown")}</FieldLabel>
                <Input id="cooldownSeconds" name="cooldownSeconds" type="number" min={0} max={600} defaultValue={session.submission_cooldown_seconds} aria-invalid={!!errors.cooldownSeconds} />
                <FieldDescription>{t("admin.cp.cooldownHint")}</FieldDescription>
                <FieldError errors={fieldErrors(errors.cooldownSeconds)} />
              </Field>
            </div>
            <Button type="submit" variant="outline" disabled={pending} className="sm:w-fit">
              {pending && <Spinner />}
              {t("common.save")}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
