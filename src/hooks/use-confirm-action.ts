"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useI18n } from "@/hooks/use-i18n";
import type { ActionResult } from "@/types";

// State for a confirm dialog whose action calls a Server Action and reports the result as a toast.
// Messages are dictionary keys.
export function useConfirmAction() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { t } = useI18n();

  function run(action: () => Promise<ActionResult<unknown>>, successKey: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(t(result.message ?? successKey));
        setOpen(false);
      } else {
        toast.error(t(result.message));
      }
    });
  }

  return { open, setOpen, pending, run };
}
