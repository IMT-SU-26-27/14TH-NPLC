import type { ProofFileSource } from "@/types/admin";

// The names payment proofs get inside the downloaded ZIP, also shown in the Excel export so finance can match them:
// the team name (finance asked for just that), " (2)" and up when two teams share a name, sorted by id so the ZIP
// and the sheet always agree. Characters Windows forbids are dropped.
export function proofFileNames(rows: ProofFileSource[]): Map<string, string> {
  const names = new Map<string, string>();
  const used = new Map<string, number>();
  for (const r of [...rows].sort((a, b) => a.id.localeCompare(b.id))) {
    if (!r.payment_proof_public_id) continue;
    const team =
      r.team_name
        .replace(/[<>:"/\|?*\u0000-\u001f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80) || "tim";
    const count = (used.get(team.toLowerCase()) ?? 0) + 1;
    used.set(team.toLowerCase(), count);
    names.set(r.id, `${count > 1 ? `${team} (${count})` : team}.${r.payment_proof_format ?? "jpg"}`);
  }
  return names;
}
