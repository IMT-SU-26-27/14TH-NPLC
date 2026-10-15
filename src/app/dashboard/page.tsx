import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import type { DashboardPageProps } from "@/types/registration";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your account, teams and registration progress.",
};

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Track your registration from team creation to acceptance.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/join" className={buttonVariants({ variant: "outline" })}>
            Join a team
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Register a team
          </Link>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-96" />
          </div>
        }
      >
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
