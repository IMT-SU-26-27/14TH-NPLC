"use client";

import { useEffect, useState } from "react";
import { STARTER_CODE } from "@/lib/cp/templates";
import type { CpLanguage } from "@/types/cp";

const key = (problemId: string, language: CpLanguage) => `nplc:cp:${problemId}:${language}`;
const LANGUAGE_KEY = "nplc:cp:language";

function read(storageKey: string): string | null {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function write(storageKey: string, value: string) {
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // Storage can be unavailable (private mode); drafts are a convenience only.
  }
}

// Editor state with a per-problem, per-language draft kept in this browser.
export function useCodeEditor(problemId: string) {
  const [language, setLanguageState] = useState<CpLanguage>("python");
  const [code, setCodeState] = useState(STARTER_CODE.python);

  // Restore the last language and draft after mounting (the server render uses the defaults).
  useEffect(() => {
    const saved = read(LANGUAGE_KEY) as CpLanguage | null;
    const lang = saved && saved in STARTER_CODE ? saved : "python";
    const draft = read(key(problemId, lang));
    const id = setTimeout(() => {
      setLanguageState(lang);
      setCodeState(draft ?? STARTER_CODE[lang]);
    }, 0);
    return () => clearTimeout(id);
  }, [problemId]);

  function setLanguage(next: CpLanguage) {
    write(LANGUAGE_KEY, next);
    setLanguageState(next);
    setCodeState(read(key(problemId, next)) ?? STARTER_CODE[next]);
  }

  function setCode(next: string) {
    setCodeState(next);
    write(key(problemId, language), next);
  }

  function reset() {
    setCode(STARTER_CODE[language]);
  }

  return { language, setLanguage, code, setCode, reset };
}
