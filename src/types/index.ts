// Shared types. Domain types live in their own files (auth.ts, registration.ts, cp.ts, ...).

// Shaped for shadcn's <FieldError errors={...} />.
export type FieldErrors = Record<string, { message: string }[] | undefined>;

// Returned by every form Server Action and read with useActionState.
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
};

export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };
