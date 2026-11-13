import { Suspense } from "react";
import { ContestFocusGate } from "@/features/cp/components/contest-focus-gate";
import { VerdictGuide } from "@/features/cp/components/verdict-guide";
import "@/features/cp/styles/layout.css";

// Every contest page (waiting room, problems, leaderboard) gets the floating judging-results guide,
// and participants get the leave-the-page monitor and the fullscreen reminder.
export default function CpLayout({ children }: LayoutProps<"/[lang]/cp">) {
  return (
    <>
      {/* Room at the bottom so the floating button never covers the last content. */}
      <div className="flex flex-1 flex-col pb-20 sm:pb-24">
        <Suspense fallback={null}>
          <ContestFocusGate />
        </Suspense>
        {children}
      </div>
      <VerdictGuide className="cp__guide" />
    </>
  );
}
