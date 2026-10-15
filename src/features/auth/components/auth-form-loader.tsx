import { OctagonXIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginForm } from "@/features/auth/components/login-form";
import { SignupForm } from "@/features/auth/components/signup-form";
import type { AuthFormLoaderProps } from "@/types/auth";

// Reads searchParams (request-time data), so pages render it inside <Suspense>.
export async function AuthFormLoader({ mode, searchParams }: AuthFormLoaderProps) {
  const { next, error } = await searchParams;

  return (
    <div className="space-y-4">
      {error === "confirm" && (
        <Alert variant="destructive">
          <OctagonXIcon />
          <AlertDescription>That confirmation link is invalid or expired. Sign in to get a new one.</AlertDescription>
        </Alert>
      )}
      {mode === "login" ? <LoginForm next={next} /> : <SignupForm next={next} />}
    </div>
  );
}
