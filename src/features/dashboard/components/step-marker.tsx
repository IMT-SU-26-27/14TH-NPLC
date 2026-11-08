import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepMarkerProps } from "@/types/registration";

// 24px marker: filled when done, ringed while current, hollow while upcoming.
export function StepMarker({ state }: StepMarkerProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-6 shrink-0 items-center justify-center rounded-full",
        state === "done" && "bg-primary text-primary-foreground",
        state === "current" && "border-primary bg-card border-2",
        state === "upcoming" && "border-border bg-card border-2",
        state === "failed" && "bg-destructive text-primary-foreground",
      )}
    >
      {state === "done" && <CheckIcon className="size-3.5" strokeWidth={3} />}
      {state === "failed" && <XIcon className="size-3.5" strokeWidth={3} />}
      {state === "current" && <span className="bg-primary size-2 rounded-full" />}
    </span>
  );
}
