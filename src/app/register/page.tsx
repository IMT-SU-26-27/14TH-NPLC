import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitionList } from "@/features/competitions/components/competition-list";

export const metadata: Metadata = {
  title: "Register a team",
  description: "Choose the competition you want to register a team for.",
};

export default function RegisterIndexPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-12">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Register a team</h1>
        <p className="text-muted-foreground">Choose a competition. You&apos;ll be the team leader.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-72" />}>
        <CompetitionList />
      </Suspense>
    </main>
  );
}
