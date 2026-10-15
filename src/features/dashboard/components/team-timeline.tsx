import { ChevronsUpDownIcon, CircleCheckIcon, CircleDashedIcon, CircleDotIcon, CircleXIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RegistrationStatusBadge } from "@/features/registration/components/registration-status-badge";
import type { TeamTimelineProps } from "@/types/registration";

type StepState = "done" | "current" | "upcoming" | "failed";

const ICON = {
  done: CircleCheckIcon,
  current: CircleDotIcon,
  upcoming: CircleDashedIcon,
  failed: CircleXIcon,
} as const;

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
  const steps: { key: string; title: string; description: string; state: StepState }[] = [
    {
      key: "registered",
      title: t("timeline.registered"),
      description: paymentPending ? t("timeline.paidPending") : formatDateTime(team.payment_submitted_at ?? team.created_at, lang),
      state: paymentPending ? "current" : "done",
    },
    {
      key: "joined",
      title: t("timeline.joined"),
      description: `${t("timeline.joinedDescription", { count: memberCount, min, max })}${teamComplete ? "" : ` · ${t("timeline.joinedHint", { min })}`}`,
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
      description:
        status === "rejected"
          ? (team.rejection_reason ?? "")
          : status === "accepted"
            ? t("timeline.acceptedDescription")
            : t("timeline.final"),
      state: status === "accepted" ? "done" : status === "rejected" ? "failed" : "upcoming",
    },
  ];

  return (
    <div className="space-y-4">
      <ol className="space-y-4">
        {steps.map((step, i) => {
          const Icon = ICON[step.state];
          return (
            <li key={step.key} className="relative flex gap-3" aria-current={step.state === "current" ? "step" : undefined}>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-6 left-2.5 h-[calc(100%-0.5rem)] w-px",
                    step.state === "done" ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <Icon
                className={cn(
                  "relative size-5 shrink-0",
                  step.state === "done" && "text-primary",
                  step.state === "current" && "text-primary",
                  step.state === "upcoming" && "text-muted-foreground",
                  step.state === "failed" && "text-destructive",
                )}
              />
              <div className="space-y-0.5">
                <p className={cn("font-medium", step.state === "upcoming" && "text-muted-foreground")}>{step.title}</p>
                {step.description && (
                  <p className={cn("text-muted-foreground text-sm", step.state === "failed" && "text-destructive")}>{step.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {team.events.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
            <ChevronsUpDownIcon />
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
