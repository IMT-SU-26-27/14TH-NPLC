import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { SiteContent, TimelineEvent } from "@/types/content";

export const CONTENT_TAG = "site-content";

// Public homepage content. Admin edits call updateTag(CONTENT_TAG).
export async function getSiteContent(): Promise<SiteContent | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  const { data } = await createSupabasePublicClient().from("site_content").select("*").maybeSingle();
  return data;
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  const { data, error } = await createSupabasePublicClient().from("timeline_events").select("*").order("starts_on");
  if (error) throw new Error(`Could not load the timeline: ${error.message}`);
  return data;
}
