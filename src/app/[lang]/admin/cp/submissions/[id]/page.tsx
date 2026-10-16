import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSubmissionDetailSection } from "@/features/cp/components/admin-submissions";
import type { AdminSubmissionPageProps } from "@/types/cp";

export async function generateMetadata({ params }: AdminSubmissionPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.submissions.detailTitle") };
}

export default function AdminSubmissionPage({ params }: AdminSubmissionPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-[40rem]" />}>
      <AdminSubmissionDetailSection params={params} />
    </Suspense>
  );
}
