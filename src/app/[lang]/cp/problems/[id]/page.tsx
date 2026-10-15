import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestProblem } from "@/features/cp/components/cp-sections";
import type { CpProblemPageProps } from "@/types/cp";

export async function generateMetadata({ params }: CpProblemPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("cp.statement"), description: t("cp.title"), robots: { index: false } };
}

export default function ProblemPage({ params }: CpProblemPageProps) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <Suspense fallback={<Skeleton className="h-[40rem]" />}>
        <ContestProblem params={params} />
      </Suspense>
    </main>
  );
}
