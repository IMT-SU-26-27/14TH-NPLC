import { Suspense } from "react";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthFormLoader } from "@/features/auth/components/auth-form-loader";
import type { AuthPageProps } from "@/types/auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an account to register your team or join one.",
};

export default function SignupPage({ searchParams }: AuthPageProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Create account</CardTitle>
          <CardDescription>Every team leader and member needs their own account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <AuthFormLoader mode="signup" searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
