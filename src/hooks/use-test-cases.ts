"use client";

import { useState } from "react";
import { CP_MAX_TEST_CASES } from "@/lib/validations/cp";
import type { TestCaseDraft } from "@/types/cp";

let seq = 0;
const nextKey = () => `tc-${++seq}`;

// Editable list of test cases for the admin problem form.
export function useTestCases(initial: Omit<TestCaseDraft, "key">[]) {
  const [cases, setCases] = useState<TestCaseDraft[]>(() =>
    (initial.length ? initial : [{ input: "", expectedOutput: "", isSample: true }]).map((c) => ({ ...c, key: nextKey() })),
  );

  return {
    cases,
    // The server rejects more than CP_MAX_TEST_CASES, so stop before the form can.
    full: cases.length >= CP_MAX_TEST_CASES,
    add: () =>
      setCases((current) =>
        current.length >= CP_MAX_TEST_CASES ? current : [...current, { key: nextKey(), input: "", expectedOutput: "", isSample: false }],
      ),
    remove: (key: string) => setCases((current) => (current.length > 1 ? current.filter((c) => c.key !== key) : current)),
    update: (key: string, patch: Partial<Omit<TestCaseDraft, "key">>) =>
      setCases((current) => current.map((c) => (c.key === key ? { ...c, ...patch } : c))),
  };
}
