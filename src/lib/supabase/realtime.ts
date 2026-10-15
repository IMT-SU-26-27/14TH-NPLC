import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Subscribes only after the signed-in user's token is on the realtime socket.
// Subscribing first (e.g. right after a full page load) joins as anon, and RLS then hides every row.
export function subscribeAuthed(name: string, build: (channel: RealtimeChannel) => RealtimeChannel): () => void {
  const supabase = createSupabaseBrowserClient();
  let channel: RealtimeChannel | null = null;
  let cancelled = false;

  (async () => {
    const { data } = await supabase.auth.getSession();
    await supabase.realtime.setAuth(data.session?.access_token ?? null);
    if (cancelled) return;
    channel = build(supabase.channel(name)).subscribe();
  })();

  return () => {
    cancelled = true;
    if (channel) supabase.removeChannel(channel);
  };
}
