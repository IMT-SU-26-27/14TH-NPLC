import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminProblemSection } from "@/features/cp/components/admin-cp-sections";
import type { AdminProblemPageProps } from "@/types/cp";

export async function generateMetadata({ params }: AdminProblemPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.cp.editProblem"), description: t("admin.cp.lead") };
}

export default function AdminProblemPage({ params, searchParams }: AdminProblemPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-[48rem]" />}>
      <AdminProblemSection params={params} searchParams={searchParams} />
    </Suspense>
  );
}
