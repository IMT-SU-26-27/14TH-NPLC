import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { JoinSection } from "@/features/registration/components/join-section";
import type { JoinPageProps } from "@/types/registration";

export async function generateMetadata({ params }: JoinPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("join.title"), description: t("meta.joinDescription") };
}

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const lang = await resolveLang(params);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <JoinSection lang={lang} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
