"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import type { FormState } from "@/types";

// A dialog holding a form: on success it shows the action's message as a toast and closes.
export function useDialogFormAction(serverAction: (prev: FormState, formData: FormData) => Promise<FormState>) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const next = await serverAction(prev, formData);
    if (next.status === "success" && next.message) {
      toast.success(t(next.message));
      setOpen(false);
    }
    return next;
  }, initialFormState);

  return { open, setOpen, state, action, pending };
}
