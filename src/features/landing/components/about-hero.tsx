import { cacheLife, cacheTag } from "next/cache";
import { CONTENT_TAG, getSiteContent } from "@/lib/data/content";
import { getT } from "@/lib/i18n/get-dictionary";
import { Hero } from "@/features/landing/components/hero";
import type { LangProps } from "@/types/i18n";

// Admin-written About text in the visitor's language, falling back to the built-in copy.
export async function AboutHero({ lang }: LangProps) {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  const t = getT(lang);
  const content = await getSiteContent();
  const title = (lang === "id" ? content?.about_title_id : content?.about_title_en) || t("landing.title");
  const body = (lang === "id" ? content?.about_body_id : content?.about_body_en) || t("landing.lead");
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return <Hero title={title} paragraphs={paragraphs} />;
}
