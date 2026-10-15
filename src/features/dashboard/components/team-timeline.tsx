import { ChevronsUpDownIcon, CircleCheckIcon, CircleDashedIcon, CircleXIcon, CircleDotIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
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

export function TeamTimeline({ team }: TeamTimelineProps) {
  const { status } = team;
  const memberCount = team.members.length;
  const teamComplete = memberCount >= team.competition.min_members;
  const paid = status === "under_review" || status === "accepted" || (status === "rejected" && !!team.payment_submitted_at);
  const reviewed = status === "accepted" || status === "rejected";

  const steps: { title: string; description: string; state: StepState }[] = [
    { title: "Team created", description: formatDateTime(team.created_at), state: "done" },
    {
      title: "Teammates joined",
      description: `${memberCount} of ${team.competition.min_members}–${team.competition.max_members} members`,
      state: teamComplete ? "done" : "current",
    },
    {
      title: "Payment submitted",
      description: team.payment_submitted_at ? formatDateTime(team.payment_submitted_at) : "Upload the QRIS payment proof",
      state: paid && status !== "rejected" ? "done" : teamComplete ? "current" : "upcoming",
    },
    {
      title: "Admin review",
      description: status === "under_review" ? "An admin is checking your payment" : reviewed ? "Reviewed" : "After payment",
      state: reviewed ? "done" : status === "under_review" ? "current" : "upcoming",
    },
    {
      title: status === "rejected" ? "Rejected" : "Accepted",
      description:
        status === "rejected" ? (team.rejection_reason ?? "") : status === "accepted" ? "You're in the competition" : "Final decision",
      state: status === "accepted" ? "done" : status === "rejected" ? "failed" : "upcoming",
    },
  ];

  return (
    <div className="space-y-6">
      <ol className="space-y-4">
        {steps.map((step, i) => {
          const Icon = ICON[step.state];
          return (
            <li key={step.title} className="relative flex gap-3">
              {i < steps.length - 1 && <span aria-hidden className="bg-border absolute top-6 left-2.5 h-[calc(100%-0.5rem)] w-px" />}
              <Icon
                className={cn(
                  "relative size-5 shrink-0",
                  step.state === "done" && "text-primary",
                  step.state === "current" && "text-foreground",
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
            History ({team.events.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
          <ul className="mt-3 space-y-2">
            {team.events.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center gap-2 text-sm">
                <RegistrationStatusBadge status={event.status} />
                {event.note && <span>{event.note}</span>}
                <Badge variant="outline" className="ml-auto">
                  {formatDateTime(event.created_at)}
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
