"use client";

import { createContext } from "react";
import type { I18nContextValue, I18nProviderProps } from "@/types/i18n";

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ lang, dict, children }: I18nProviderProps) {
  return <I18nContext value={{ lang, dict }}>{children}</I18nContext>;
}
