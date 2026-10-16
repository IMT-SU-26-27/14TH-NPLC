import { VerdictGuide } from "@/features/cp/components/verdict-guide";

// Every contest page (waiting room, problems, leaderboard) gets the floating judging-results guide.
export default function CpLayout({ children }: LayoutProps<"/[lang]/cp">) {
  return (
    <>
      {/* Room at the bottom so the floating button never covers the last content. */}
      <div className="flex flex-1 flex-col pb-20 sm:pb-24">{children}</div>
      <VerdictGuide />
    </>
  );
}
