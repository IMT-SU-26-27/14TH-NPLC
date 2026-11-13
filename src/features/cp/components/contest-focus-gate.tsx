import { getCurrentUser } from "@/lib/data/auth";
import { ContestFocusMonitor } from "@/features/cp/components/contest-focus-monitor";

// Only participants are monitored; admins previewing the contest are not.
export async function ContestFocusGate() {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return null;
  return <ContestFocusMonitor />;
}
