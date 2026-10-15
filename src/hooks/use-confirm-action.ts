"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/types";

// State for a confirm dialog whose action calls a Server Action and reports the result as a toast.
export function useConfirmAction() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult<unknown>>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? successMessage);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return { open, setOpen, pending, run };
}
