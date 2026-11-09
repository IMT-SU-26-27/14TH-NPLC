import { HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime, memberRange } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StepMarker } from "@/features/dashboard/components/step-marker";
import { RegistrationStatusBadge } from "@/features/registration/components/registration-status-badge";
import type { TeamTimelineProps, TimelineStep } from "@/types/registration";

// Event notes written by the database in English; shown translated when we know them.
const EVENT_NOTE: Record<string, string> = {
  "Registration created": "events.created",
  "Registration created with payment proof": "events.createdWithPayment",
  "Payment proof submitted": "events.paymentSubmitted",
  "Registration accepted": "events.accepted",
};

export function TeamTimeline({ team, lang }: TeamTimelineProps) {
  const t = getT(lang);
  const { status } = team;
  const { min_members: min, max_members: max } = team.competition;
  const memberCount = team.members.length;
  const teamComplete = memberCount >= min;
  const reviewed = status === "accepted" || status === "rejected";
  const paymentPending = status === "pending_payment" || status === "rejected";

  // Registering means paying: the team exists once its payment proof is sent.
  const steps: TimelineStep[] = [
    {
      key: "registered",
      title: t("timeline.registered"),
      description: paymentPending
        ? t(team.competition.payment_method === "bank_transfer" ? "timeline.paidPendingBank" : "timeline.paidPendingQris")
        : formatDateTime(team.payment_submitted_at ?? team.created_at, lang),
      state: paymentPending ? "current" : "done",
    },
    {
      key: "joined",
      title: t("timeline.joined"),
      description: `${t("timeline.joinedDescription", { count: memberCount, range: memberRange(min, max) })}${teamComplete ? "" : ` · ${t("timeline.joinedHint", { min })}`}`,
      state: teamComplete ? "done" : "current",
    },
    {
      key: "review",
      title: t("timeline.review"),
      description: status === "under_review" ? t("timeline.reviewing") : reviewed ? t("timeline.reviewed") : t("timeline.afterPayment"),
      state: reviewed ? "done" : status === "under_review" ? "current" : "upcoming",
    },
    {
      key: "final",
      title: status === "rejected" ? t("timeline.rejected") : t("timeline.accepted"),
      // The reason itself is shown once, in the alert under the team name.
      description:
        status === "rejected"
          ? t("timeline.rejectedDescription")
          : status === "accepted"
            ? t("timeline.acceptedDescription")
            : t("timeline.final"),
      state: status === "accepted" ? "done" : status === "rejected" ? "failed" : "upcoming",
    },
  ];

  return (
    <div className="space-y-4">
      <ol>
        {steps.map((step, i) => (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0" aria-current={step.state === "current" ? "step" : undefined}>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn("absolute top-6 bottom-0 left-[11px] w-0.5", step.state === "done" ? "bg-(image:--tagline-gradient)" : "bg-border")}
              />
            )}
            <StepMarker state={step.state} final={i === steps.length - 1} />
            <div className="min-w-0 text-sm">
              <p className={cn("font-medium", step.state === "upcoming" && "text-muted-foreground")}>{step.title}</p>
              {step.description && (
                <p className={cn("text-muted-foreground", step.state === "failed" && "text-destructive")}>{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* One segment per step: filled once the step is done. */}
      <div aria-hidden className="flex gap-1">
        {steps.map((step, i) => (
          <span
            key={step.key}
            className={cn(
              "h-2 flex-1 rounded-full",
              step.state !== "done" && "bg-primary/15",
              step.state === "done" && (i === steps.length - 1 ? "bg-highlight" : "bg-(image:--tagline-gradient)"),
            )}
          />
        ))}
      </div>

      {team.events.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
            <HistoryIcon />
            {t("timeline.history", { count: team.events.length })}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-3 space-y-2">
              {team.events.map((event) => (
                <li key={event.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <RegistrationStatusBadge status={event.status} />
                  {event.note && <span>{EVENT_NOTE[event.note] ? t(EVENT_NOTE[event.note]) : event.note}</span>}
                  <Badge variant="outline" className="ml-auto">
                    {formatDateTime(event.created_at, lang)}
                  </Badge>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
