import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("profile.title")}</h1>
          <p className="text-muted-foreground">{t("profile.lead")}</p>
        </div>
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-72" />
              <Skeleton className="h-96" />
            </div>
          }
        >
          <ProfileContent />
        </Suspense>
      </div>
    </main>
  );
}
