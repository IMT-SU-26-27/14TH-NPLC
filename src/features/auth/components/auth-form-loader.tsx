import { LoginForm } from "@/features/auth/components/login-form";
import { SignupForm } from "@/features/auth/components/signup-form";
import type { AuthFormLoaderProps } from "@/types/auth";

// Reads searchParams (request-time data), so pages render it inside <Suspense>.
export async function AuthFormLoader({ mode, searchParams }: AuthFormLoaderProps) {
  const { next } = await searchParams;
  return mode === "login" ? <LoginForm next={next} /> : <SignupForm next={next} />;
}
