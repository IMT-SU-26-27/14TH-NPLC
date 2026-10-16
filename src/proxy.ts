import { NextResponse, type NextRequest } from "next/server";
import { redirectWithCookies, updateSession } from "@/lib/supabase/proxy";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/config";

const SIGNED_IN_ONLY = ["/dashboard", "/register", "/join", "/admin", "/cp", "/reset-password"];
const SIGNED_OUT_ONLY = ["/login", "/signup", "/forgot-password"];

function matches(path: string, prefixes: string[]) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

// 1. Every page lives under /id or /en; unprefixed URLs go to the remembered (or default) language.
// 2. Optimistic route guards on the path without its locale. Pages and RLS enforce the same rules again.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/auth/")) {
    const { response } = await updateSession(request);
    return response();
  }

  const [, first, ...rest] = pathname.split("/");
  if (!isLocale(first)) {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const lang = isLocale(saved) ? saved : DEFAULT_LOCALE;
    return NextResponse.redirect(new URL(`/${lang}${pathname === "/" ? "" : pathname}${search}`, request.url));
  }

  const lang = first;
  const path = `/${rest.join("/")}`;
  const { supabase, user, response } = await updateSession(request);

  const withLocale = (res: NextResponse) => {
    if (request.cookies.get(LOCALE_COOKIE)?.value !== lang) {
      res.cookies.set(LOCALE_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return res;
  };
  const to = (target: string, params?: Record<string, string>) => {
    const url = new URL(`/${lang}${target}`, request.url);
    Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
    return withLocale(redirectWithCookies(url, response()));
  };

  if (!user) {
    if (matches(path, SIGNED_IN_ONLY)) return to("/login", { next: `${pathname}${search}` });
    return withLocale(response());
  }

  if (matches(path, SIGNED_OUT_ONLY)) return to("/dashboard");

  if (matches(path, ["/admin", "/cp"])) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role === "admin";

    if (matches(path, ["/admin"]) && !isAdmin) return to("/dashboard");

    // /cp: accepted competitive programming teams only, and only while the admin has the contest live.
    // Paused works like ended: waiting room and leaderboard only, until the admin resumes.
    if (matches(path, ["/cp"]) && !isAdmin) {
      const { data: access } = await supabase.rpc("cp_access");
      if (!access || access.length === 0) return to("/dashboard", { notice: "cp-not-registered" });

      const status = access.some((row) => row.session_status === "live")
        ? "live"
        : access.some((row) => row.session_status === "paused")
          ? "paused"
          : access.some((row) => row.session_status === "ended")
          ? "ended"
          : "scheduled";
      const onWaiting = path === "/cp/waiting";
      const onLeaderboard = path === "/cp/leaderboard";

      if (status === "live" && onWaiting) return to("/cp");
      if ((status === "paused" || status === "ended") && !onWaiting && !onLeaderboard) return to("/cp/waiting");
      if (status === "scheduled" && !onWaiting) return to("/cp/waiting");
    }
  }

  return withLocale(response());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
