import { CheckIcon, FlagIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepMarkerProps } from "@/types/registration";

// 24px marker: filled when done, ringed while current, hollow while upcoming. The last step lights up lime with a flag once accepted.
export function StepMarker({ state, final = false }: StepMarkerProps) {
  const accepted = final && state === "done";

  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-6 shrink-0 items-center justify-center rounded-full",
        state === "done" && !accepted && "bg-primary text-primary-foreground",
        accepted && "bg-highlight text-highlight-foreground shadow-[0_0_8px_var(--highlight)]",
        state === "current" && "border-primary bg-card border-2",
        state === "upcoming" && "border-border bg-card border-2",
        state === "failed" && "bg-destructive text-primary-foreground",
      )}
    >
      {accepted && <FlagIcon className="size-3.5" strokeWidth={2.5} />}
      {state === "done" && !accepted && <CheckIcon className="size-3.5" strokeWidth={3} />}
      {state === "failed" && <XIcon className="size-3.5" strokeWidth={3} />}
      {state === "current" && <span className="bg-primary size-2 rounded-full" />}
    </span>
  );
}
