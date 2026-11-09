import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { LoPostSection } from "@/features/rally/components/lo-post-section";
import type { LoPostPageProps } from "@/types/rally";

export async function generateMetadata({ params }: LoPostPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("rally.lo.stationTitle"), description: t("rally.lo.lead"), robots: { index: false } };
}

export default function LoPostPage({ params }: LoPostPageProps) {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <LoPostSection params={params} />
      </Suspense>
    </main>
  );
}
