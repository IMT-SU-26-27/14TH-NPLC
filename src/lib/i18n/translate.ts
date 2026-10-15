import type { Dictionary, TranslateParams } from "@/types/i18n";

// Looks up a dot path ("auth.signIn") and fills {placeholders}.
// Unknown keys are returned as-is, so raw database messages still show something useful.
export function translate(dict: Dictionary, key: string, params?: TranslateParams): string {
  const value = key.split(".").reduce<unknown>((node, part) => {
    if (node && typeof node === "object" && part in node) return (node as Record<string, unknown>)[part];
    return undefined;
  }, dict);
  const text = typeof value === "string" ? value : key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
