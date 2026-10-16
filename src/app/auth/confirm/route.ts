import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { nextPathSchema } from "@/lib/validations/auth";

// Target of the confirmation and password reset emails. Handles both the PKCE `code` and the `token_hash` link formats.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = nextPathSchema.parse(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  // The proxy adds the visitor's language prefix.
  if (type === "recovery" || next.endsWith("/reset-password")) {
    return NextResponse.redirect(new URL("/forgot-password?error=recovery", origin));
  }
  return NextResponse.redirect(new URL("/login?error=confirm", origin));
}
