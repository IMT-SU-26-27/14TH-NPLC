import { formDraftSchema } from "@/lib/validations/form-draft";
import type { DraftField, FormDraft, FormDraftValues } from "@/types/form-draft";

// Form drafts in localStorage, so a half-filled form survives a reload (e.g. a phone that reloads
// the tab after switching to a banking app to pay). Browser only.

const PREFIX = "nplc:draft:";
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Never stored: secrets, files (a browser cannot restore them) and values the page sets itself.
const SKIPPED_INPUT_TYPES = new Set(["password", "file", "hidden", "submit", "button", "reset", "image", "checkbox", "radio"]);

const listeners = new Set<() => void>();
const restoredKeys = new Set<string>();

export function draftKey(formId: string, userId: string): string {
  return `${PREFIX}${formId}:${userId}`;
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeDrafts(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab of the same form saving or deleting the draft.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function parseDraft(raw: string): FormDraft | null {
  try {
    const parsed = formDraftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// The stored draft, or null. A draft that is expired or unreadable is deleted.
export function readDraft(key: string): FormDraft | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const draft = parseDraft(raw);
    if (draft && Date.now() - draft.savedAt <= DRAFT_MAX_AGE_MS) return draft;
    store.removeItem(key);
  } catch {
    // Blocked storage: behave as if there is no draft.
  }
  return null;
}

export function readDraftSavedAt(key: string): number | null {
  return readDraft(key)?.savedAt ?? null;
}

export function writeDraft(key: string, values: FormDraftValues): void {
  const draft: FormDraft = { savedAt: Date.now(), values };
  try {
    storage()?.setItem(key, JSON.stringify(draft));
  } catch {
    // Full or blocked storage: the form still works, it just isn't saved.
  }
  emit();
}

export function removeDraft(key: string): void {
  try {
    storage()?.removeItem(key);
  } catch {
    // Blocked storage has nothing to remove.
  }
  restoredKeys.delete(key);
  emit();
}

// Every draft on this device, for sign-out on a shared computer.
export function removeAllDrafts(): void {
  const store = storage();
  if (!store) return;
  try {
    const keys = Array.from({ length: store.length }, (_, i) => store.key(i)).filter((k): k is string => !!k?.startsWith(PREFIX));
    for (const key of keys) store.removeItem(key);
  } catch {
    // Blocked storage has nothing to remove.
  }
  restoredKeys.clear();
  emit();
}

export function isDraftRestored(key: string): boolean {
  return restoredKeys.has(key);
}

export function setDraftRestored(key: string, restored: boolean): void {
  if (restoredKeys.has(key) === restored) return;
  if (restored) restoredKeys.add(key);
  else restoredKeys.delete(key);
  emit();
}

function draftFields(form: HTMLFormElement, exclude: readonly string[]): DraftField[] {
  return Array.from(form.elements).filter((el): el is DraftField => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) return false;
    if (!el.name || el.disabled || exclude.includes(el.name)) return false;
    if (el instanceof HTMLInputElement && (el.readOnly || SKIPPED_INPUT_TYPES.has(el.type))) return false;
    return !(el instanceof HTMLTextAreaElement && el.readOnly);
  });
}

function defaultValueOf(el: DraftField): string {
  if (el instanceof HTMLSelectElement) {
    const option = Array.from(el.options).find((o) => o.defaultSelected) ?? el.options[0];
    return option?.value ?? "";
  }
  return el.defaultValue;
}

// The form's values, or null when every field still holds its default (nothing worth keeping).
export function collectDraftValues(form: HTMLFormElement, exclude: readonly string[]): FormDraftValues | null {
  const fields = draftFields(form, exclude);
  if (fields.every((el) => el.value === defaultValueOf(el))) return null;
  return Object.fromEntries(fields.map((el) => [el.name, el.value]));
}

// Puts a draft back into the form. Returns true when it changed at least one field.
export function applyDraftValues(form: HTMLFormElement, values: FormDraftValues, exclude: readonly string[]): boolean {
  let changed = false;
  for (const el of draftFields(form, exclude)) {
    const value = values[el.name];
    if (value === undefined || value === el.value) continue;
    el.value = value;
    changed = true;
  }
  return changed;
}

export function resetDraftFields(form: HTMLFormElement, exclude: readonly string[]): void {
  for (const el of draftFields(form, exclude)) el.value = defaultValueOf(el);
}

export function sameDraftValues(a: FormDraftValues, b: FormDraftValues): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
}
