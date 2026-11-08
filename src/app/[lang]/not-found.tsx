import type { Metadata } from "next";
import { NotFoundView } from "@/components/shared/not-found-view";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import type { LangPageProps } from "@/types/i18n";

// After notFound(), Next builds the head from the layouts and this file only, so the
// catch-all page's generateMetadata never reaches a production 404. The title lives here;
// Next adds the noindex tag to every 404 by itself.
export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const { lang } = await params;
  const t = getT(isLocale(lang) ? lang : DEFAULT_LOCALE);
  return { title: t("system.notFoundTitle") };
}

export default function NotFound() {
  return <NotFoundView />;
}
