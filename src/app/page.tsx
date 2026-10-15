import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { Hero } from "@/features/landing/components/hero";
import { CompetitionList } from "@/features/competitions/components/competition-list";

export const metadata: Metadata = {
  title: "14th NPLC: Programming & Logic Competition",
  description: "Register your team for the 14th NPLC competitive programming and logic competitions.",
};

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <section id="competitions" className="mx-auto max-w-6xl scroll-mt-20 space-y-6 px-4 pb-24">
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Competitions</h2>
          <p className="text-muted-foreground">Pick one, create your team, and share its code with your teammates.</p>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          }
        >
          <CompetitionList />
        </Suspense>
      </section>
    </main>
  );
}
