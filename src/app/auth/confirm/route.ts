import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { originFromHeaders } from "@/lib/request-origin";
import { nextPathSchema } from "@/lib/validations/auth";

// Target of the password reset email, the only email the site sends. Handles both the PKCE `code` and the `token_hash` link formats.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  // Never request.nextUrl.origin: behind the proxy that resolves to 0.0.0.0:3000.
  const origin = originFromHeaders(request.headers) || request.nextUrl.origin;
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
  return NextResponse.redirect(new URL("/forgot-password?error=recovery", origin));
}
