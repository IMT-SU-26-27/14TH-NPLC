import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestAccessGate } from "@/features/cp/components/contest-access-gate";
import { VerdictGuide } from "@/features/cp/components/verdict-guide";
import "@/features/cp/styles/layout.css";

// Every contest page (waiting room, problems, leaderboard) gets the floating judging-results guide, and participants
// get the leave-the-page monitor, the fullscreen reminder and the one-device-per-team lock.
export default function CpLayout({ children }: LayoutProps<"/[lang]/cp">) {
  return (
    <>
      {/* Room at the bottom so the floating button never covers the last content. */}
      <div className="flex flex-1 flex-col pb-20 sm:pb-24">
        <Suspense fallback={<Skeleton className="mx-auto mt-8 h-96 w-full max-w-6xl" />}>
          <ContestAccessGate>{children}</ContestAccessGate>
        </Suspense>
      </div>
      <VerdictGuide className="cp__guide" />
    </>
  );
}
