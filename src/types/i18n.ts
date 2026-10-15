import type { id } from "@/lib/i18n/dictionaries/id";

export type Locale = "id" | "en";

// The Indonesian dictionary is the source of truth; English must match its shape.
export type Dictionary = typeof id;

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = T extends string ? never : { [K in keyof T]: T[K] extends string ? K : Join<K, Paths<T[K]>> }[keyof T];

// Dot path to any string in the dictionary, e.g. "auth.signIn".
export type MessageKey = Paths<Dictionary>;

export type TranslateParams = Record<string, string | number>;

export type I18nContextValue = {
  lang: Locale;
  dict: Dictionary;
};

export type I18nProviderProps = I18nContextValue & {
  children: React.ReactNode;
};

export type LangParams = Promise<{ lang: string }>;

export type LangPageProps = {
  params: LangParams;
};

export type LangProps = {
  lang: Locale;
};
