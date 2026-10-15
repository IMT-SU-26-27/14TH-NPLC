import type { NextRequest } from "next/server";
import { redirectWithCookies, updateSession } from "@/lib/supabase/proxy";

const SIGNED_IN_ONLY = ["/dashboard", "/register", "/join", "/admin", "/cp"];
const SIGNED_OUT_ONLY = ["/login", "/signup"];

function matches(path: string, prefixes: string[]) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

// Optimistic route guards. Pages and RLS enforce the same rules again on the server.
export async function proxy(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request);
  const path = request.nextUrl.pathname;
  const to = (pathname: string, params?: Record<string, string>) => {
    const url = new URL(pathname, request.url);
    Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
    return redirectWithCookies(url, response());
  };

  if (!user) {
    if (matches(path, SIGNED_IN_ONLY)) return to("/login", { next: path });
    return response();
  }

  if (matches(path, SIGNED_OUT_ONLY)) return to("/dashboard");

  if (matches(path, ["/admin", "/cp"])) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role === "admin";

    if (matches(path, ["/admin"]) && !isAdmin) return to("/dashboard");

    // /cp: accepted competitive programming teams only, and only while the admin has the contest live.
    if (matches(path, ["/cp"]) && !isAdmin) {
      const { data: access } = await supabase.rpc("cp_access");
      if (!access || access.length === 0) return to("/dashboard", { notice: "cp-not-registered" });

      const status = access.some((row) => row.session_status === "live")
        ? "live"
        : access.some((row) => row.session_status === "ended")
          ? "ended"
          : "scheduled";
      const onWaiting = path === "/cp/waiting";
      const onLeaderboard = path === "/cp/leaderboard";

      if (status === "live" && onWaiting) return to("/cp");
      if (status === "ended" && !onWaiting && !onLeaderboard) return to("/cp/waiting");
      if (status === "scheduled" && !onWaiting) return to("/cp/waiting");
    }
  }

  return response();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
