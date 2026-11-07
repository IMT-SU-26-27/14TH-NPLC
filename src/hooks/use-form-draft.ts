"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  applyDraftValues,
  collectDraftValues,
  draftKey,
  isDraftRestored,
  readDraft,
  readDraftSavedAt,
  removeDraft,
  resetDraftFields,
  sameDraftValues,
  setDraftRestored,
  subscribeDrafts,
  writeDraft,
} from "@/lib/form-draft";
import type { FormDraftServerAction, UseFormDraftOptions, UseFormDraftResult } from "@/types/form-draft";

const SAVE_DELAY_MS = 500;

// Auto-saves an uncontrolled form to localStorage and puts the draft back when the form mounts again.
// Attach `formRef` to the <form>. Password, file and hidden inputs are never saved.
export function useFormDraft({ formId, userId, exclude = [] }: UseFormDraftOptions): UseFormDraftResult {
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const key = draftKey(formId, userId);
  const excludeKey = exclude.join("\n");

  const savedAt = useSyncExternalStore(subscribeDrafts, () => readDraftSavedAt(key), () => null);
  const restored = useSyncExternalStore(subscribeDrafts, () => isDraftRestored(key), () => false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const skipped = excludeKey ? excludeKey.split("\n") : [];

    const draft = readDraft(key);
    if (!draft) setDraftRestored(key, false);
    else if (applyDraftValues(form, draft.values, skipped)) setDraftRestored(key, true);

    const save = () => {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
      const values = collectDraftValues(form, skipped);
      const stored = readDraft(key);
      if (!values) {
        if (stored) removeDraft(key);
      } else if (!stored || !sameDraftValues(stored.values, values)) {
        writeDraft(key, values);
      }
    };
    const schedule = () => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(save, SAVE_DELAY_MS);
    };
    // Saves a change still waiting for the delay. A draft that was just cleared stays cleared.
    const flush = () => {
      if (timerRef.current !== undefined) save();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };
    // React empties a <form action> after it submits. Put the draft back so a failed submit keeps the input.
    const onReset = () => {
      window.setTimeout(() => {
        const current = readDraft(key);
        if (current) applyDraftValues(form, current.values, skipped);
      }, 0);
    };

    // Only "input": browsers also fire "change" when a field loses focus, e.g. as the form unmounts after a
    // successful submit, which would save the draft again right after it was deleted.
    form.addEventListener("input", schedule);
    form.addEventListener("submit", flush);
    form.addEventListener("reset", onReset);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      form.removeEventListener("input", schedule);
      form.removeEventListener("submit", flush);
      form.removeEventListener("reset", onReset);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flush);
    };
  }, [key, excludeKey]);

  const clearDraft = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
    removeDraft(key);
  }, [key]);

  const discardDraft = useCallback(() => {
    const form = formRef.current;
    clearDraft();
    if (!form) return;
    resetDraftFields(form, excludeKey ? excludeKey.split("\n") : []);
    // The banner holding the button is gone, so move focus back into the form.
    form.querySelector<HTMLElement>("input:not([type=hidden]):not([disabled]), textarea, select")?.focus();
  }, [clearDraft, excludeKey]);

  const clearOnSuccess = useCallback(
    <P>(serverAction: FormDraftServerAction<P>): FormDraftServerAction<P> =>
      async (prev, payload) => {
        try {
          const result = await serverAction(prev, payload);
          if (result.status === "success") clearDraft();
          return result;
        } catch (error) {
          // A Server Action that ends in redirect() rejects here; the redirect means it succeeded.
          if (isRedirectError(error)) clearDraft();
          throw error;
        }
      },
    [clearDraft],
  );

  return { formRef, restored, savedAt, discardDraft, clearOnSuccess };
}
