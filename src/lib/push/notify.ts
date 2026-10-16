import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendPushToUsers } from "@/lib/push/server";
import type { CpSessionStatus } from "@/types/cp";

// The events that send a push. Each is run with after() from a Server Action, so the user
// never waits for it, and logs instead of throwing so a push failure can't break the action.

async function safely(name: string, run: () => Promise<unknown>) {
  try {
    await run();
  } catch (err) {
    console.error(`[push] ${name} failed`, err);
  }
}

async function loadTeam(registrationId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("registrations")
    .select("id, team_name, status, rejection_reason, leader_id, competition:competitions ( name ), members:registration_members ( user_id )")
    .eq("id", registrationId)
    .maybeSingle();
  return data;
}

async function adminIds() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("profiles").select("id").eq("role", "admin");
  return (data ?? []).map((p) => p.id);
}

// Accepted or rejected by an admin: every member of the team.
export function notifyRegistrationReviewed(registrationId: string) {
  return safely("registration reviewed", async () => {
    const team = await loadTeam(registrationId);
    if (!team || (team.status !== "accepted" && team.status !== "rejected")) return;
    await sendPushToUsers(
      team.members.map((m) => m.user_id),
      {
        title: team.status === "accepted" ? "push.acceptedTitle" : "push.rejectedTitle",
        body: team.status === "accepted" ? "push.acceptedBody" : "push.rejectedBody",
        params: { team: team.team_name, competition: team.competition?.name ?? "", reason: team.rejection_reason ?? "" },
        url: "/dashboard",
        tag: `registration-${team.id}`,
      },
    );
  });
}

// A payment proof is waiting for review (new team, or a new proof after a rejection): every admin.
export function notifyAdminsPaymentToReview(registrationId: string, resubmitted: boolean) {
  return safely("payment to review", async () => {
    const [team, admins] = await Promise.all([loadTeam(registrationId), adminIds()]);
    if (!team) return;
    await sendPushToUsers(admins, {
      title: resubmitted ? "push.proofResubmittedTitle" : "push.newRegistrationTitle",
      body: "push.toReviewBody",
      params: { team: team.team_name, competition: team.competition?.name ?? "" },
      url: `/admin/registrations/${team.id}`,
      tag: `review-${team.id}`,
    });
  });
}

// Someone joined with the team code: the leader.
export function notifyLeaderMemberJoined(registrationId: string, memberName: string) {
  return safely("member joined", async () => {
    const team = await loadTeam(registrationId);
    if (!team) return;
    await sendPushToUsers([team.leader_id], {
      title: "push.memberJoinedTitle",
      body: "push.memberJoinedBody",
      params: { name: memberName, team: team.team_name },
      url: "/dashboard",
    });
  });
}

// The admin started, paused, resumed or ended the contest: every member of every accepted team.
export function notifyContestStatus(competitionId: string, status: CpSessionStatus, resumed: boolean) {
  return safely("contest status", async () => {
    if (status === "scheduled") return;
    const admin = createSupabaseAdminClient();
    const [{ data: competition }, { data: members }] = await Promise.all([
      admin.from("competitions").select("name").eq("id", competitionId).maybeSingle(),
      admin.from("registration_members").select("user_id, registration:registrations!inner ( status )").eq("competition_id", competitionId).eq("registration.status", "accepted"),
    ]);
    const key = status === "live" ? (resumed ? "contestResumed" : "contestStarted") : status === "paused" ? "contestPaused" : "contestEnded";
    await sendPushToUsers(
      (members ?? []).map((m) => m.user_id),
      {
        title: `push.${key}Title`,
        body: `push.${key}Body`,
        params: { competition: competition?.name ?? "" },
        url: status === "live" ? "/cp" : "/cp/waiting",
        tag: `contest-${competitionId}`,
      },
    );
  });
}
