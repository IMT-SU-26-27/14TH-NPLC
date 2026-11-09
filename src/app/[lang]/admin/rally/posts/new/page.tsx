import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { RallyPostEditSection } from "@/features/rally/components/rally-post-edit-section";
import type { RallyPostEditSectionProps } from "@/types/rally";

export async function generateMetadata({ params }: RallyPostEditSectionProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("rally.admin.newPost"), description: t("rally.admin.lead") };
}

export default function AdminNewRallyPostPage({ params }: RallyPostEditSectionProps) {
  return (
    <Suspense fallback={<Skeleton className="h-[40rem]" />}>
      <RallyPostEditSection params={params} />
    </Suspense>
  );
}
