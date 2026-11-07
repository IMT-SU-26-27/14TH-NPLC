import type { RefObject } from "react";
import type { z } from "zod";
import type { formDraftSchema } from "@/lib/validations/form-draft";
import type { FormState } from "@/types";

export type FormDraft = z.infer<typeof formDraftSchema>;

export type FormDraftValues = FormDraft["values"];

// A form control whose value a draft keeps.
export type DraftField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type FormDraftServerAction<P> = (prev: FormState, payload: P) => Promise<FormState>;

export type UseFormDraftOptions = {
  // Names the form in the storage key, e.g. "signup" or "register-team-cp".
  formId: string;
  // The signed-in user, or "guest" before sign-up.
  userId: string;
  // Extra field names to leave out. Password, file and hidden inputs are always left out.
  exclude?: string[];
};

export type UseFormDraftResult = {
  formRef: RefObject<HTMLFormElement | null>;
  // A saved draft was put back into the form when it mounted.
  restored: boolean;
  // When the stored draft was last saved (ms since epoch), or null when there is none.
  savedAt: number | null;
  // Deletes the draft and puts the restored fields back to their default values.
  discardDraft: () => void;
  // Wraps a form Server Action so the draft is deleted once it succeeds or redirects.
  clearOnSuccess: <P>(serverAction: FormDraftServerAction<P>) => FormDraftServerAction<P>;
};

export type FormDraftBannerProps = {
  // The form has file inputs, which a draft cannot keep.
  hasFiles?: boolean;
  onDiscard: () => void;
};

export type FormDraftStatusProps = {
  savedAt: number | null;
  className?: string;
};
