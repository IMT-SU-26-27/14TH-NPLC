// Shared types. Domain types live in their own files (auth.ts, registration.ts, cp.ts, ...).

// Shaped for shadcn's <FieldError errors={...} />.
export type FieldErrors = Record<string, { message: string }[] | undefined>;

// Returned by every form Server Action and read with useActionState.
// `message` is a dictionary key (see src/lib/i18n), translated on the client.
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  params?: Record<string, string | number>;
  fieldErrors?: FieldErrors;
};

export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string; params?: Record<string, string | number> }
  | { ok: false; message: string; params?: Record<string, string | number> };
