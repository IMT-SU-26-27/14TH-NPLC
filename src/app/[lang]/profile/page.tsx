import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBand } from "@/components/shared/page-band";
import { ProfileContent } from "@/features/profile/components/profile-content";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("profile.title"), description: t("meta.profileDescription") };
}

export default async function ProfilePage({ params }: LangPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="flex-1">
      <PageBand index="12" label={t("profile.label")} title={t("profile.title")} lead={t("profile.lead")} mascot={{ src: "/auth/maskot-2.webp" }} />
      <div className="mx-auto w-full max-w-160 space-y-4 px-4 pt-8 pb-12 sm:space-y-5 sm:pt-12 sm:pb-16">
        <Suspense
          fallback={
            <div className="space-y-5">
              <Skeleton className="h-80 rounded-[12px]" />
              <Skeleton className="h-96 rounded-[12px]" />
            </div>
          }
        >
          <ProfileContent />
        </Suspense>
      </div>
    </main>
  );
}
