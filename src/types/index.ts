import type { ReactNode } from "react";

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

export type TablePaginationProps = {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  summary: string;
  previousLabel: string;
  nextLabel: string;
  // When set, pages change in the browser (client components) instead of following the link.
  onSelect?: (page: number) => void;
};

// Decorative unless `alt` is given. Shown from md up only.
export type PageBandMascot = {
  src: string;
  alt?: string;
};

export type PageBandProps = {
  // Page number from the design, e.g. "02".
  index: string;
  // Text after the "//" in the kicker.
  label: string;
  title: string;
  lead?: string;
  mascot?: PageBandMascot;
  // Extra content under the lead.
  children?: ReactNode;
};
