import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminTeamDevices, TeamDevicePerson } from "@/types/team-device";

// Must match the 90 s in team_device_sync.
const OFFLINE_AFTER_MS = 90_000;
const HISTORY_LIMIT = 20;

function personName(person: TeamDevicePerson): string | null {
  return person ? person.full_name.trim() || person.email : null;
}

// Admin -> CP -> Activity: the rule switch, each team's active device and the latest changes (RLS: admins only).
export async function getAdminTeamDevices(competitionId: string): Promise<AdminTeamDevices> {
  const supabase = await createSupabaseServerClient();
  const [competition, devices, events] = await Promise.all([
    supabase.from("competitions").select("single_device").eq("id", competitionId).single(),
    supabase
      .from("team_devices")
      .select(
        "registration_id, label, claimed_at, seen_at, pending_label, team:registrations!inner ( team_name, competition_id ), holder:profiles!team_devices_user_id_fkey ( full_name, email ), asker:profiles!team_devices_pending_user_id_fkey ( full_name, email )",
      )
      .eq("team.competition_id", competitionId),
    supabase
      .from("team_device_events")
      .select("id, action, label, created_at, team:registrations!inner ( team_name, competition_id ), member:profiles ( full_name, email )")
      .eq("team.competition_id", competitionId)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
  ]);

  const now = Date.now();
  return {
    singleDevice: competition.data?.single_device ?? true,
    devices: (devices.data ?? [])
      .map((d) => ({
        registrationId: d.registration_id,
        teamName: d.team.team_name,
        holderName: personName(d.holder),
        holderLabel: d.label,
        claimedAt: d.claimed_at,
        seenAt: d.seen_at,
        online: now - new Date(d.seen_at).getTime() < OFFLINE_AFTER_MS,
        pendingName: d.pending_label === null ? null : (personName(d.asker) ?? ""),
        pendingLabel: d.pending_label,
      }))
      .sort((a, b) => a.teamName.localeCompare(b.teamName)),
    events: (events.data ?? []).map((e) => ({
      id: e.id,
      teamName: e.team.team_name,
      action: e.action,
      memberName: personName(e.member),
      label: e.label,
      createdAt: e.created_at,
    })),
  };
}
