import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import type { CatchAllPageProps } from "@/types/system";

// Unmatched URLs under /id or /en: render [lang]/not-found.tsx inside the normal layout
// (header, footer, language) instead of the framework's bare 404.
export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("system.notFoundTitle"), robots: { index: false } };
}

export default function CatchAllPage() {
  notFound();
}
