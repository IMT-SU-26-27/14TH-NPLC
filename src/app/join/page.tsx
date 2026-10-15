import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { JoinSection } from "@/features/registration/components/join-section";
import type { JoinPageProps } from "@/types/registration";

export const metadata: Metadata = {
  title: "Join a team",
  description: "Join your team with the code your team leader shared.",
};

export default function JoinPage({ searchParams }: JoinPageProps) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <JoinSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
