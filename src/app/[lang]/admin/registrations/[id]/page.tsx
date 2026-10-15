import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { RegistrationDetail } from "@/features/admin/components/registration-detail";
import type { AdminIdPageProps } from "@/types/admin";

export async function generateMetadata({ params }: AdminIdPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("admin.registrations.title"), description: t("meta.adminRegistrationsDescription") };
}

export default function AdminRegistrationDetailPage({ params }: AdminIdPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-[40rem]" />}>
      <RegistrationDetail params={params} />
    </Suspense>
  );
}
