"use client";

import { use } from "react";
import { I18nContext } from "@/components/shared/i18n-provider";
import { localePath } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";
import type { TranslateParams } from "@/types/i18n";

// Language, translator and locale-aware links for client components.
export function useI18n() {
  const context = use(I18nContext);
  if (!context) throw new Error("useI18n must be used inside <I18nProvider>");
  const { lang, dict } = context;

  const t = (key: string, params?: TranslateParams) => translate(dict, key, params);

  return {
    lang,
    dict,
    t,
    href: (path: string) => localePath(lang, path),
    // Translates message keys returned by Server Actions for shadcn's <FieldError errors={...} />.
    fieldErrors: (errors?: { message: string }[]) => errors?.map((e) => ({ message: t(e.message) })),
  };
}
