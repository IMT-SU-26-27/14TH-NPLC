import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterBanner } from "@/features/registration/components/register-banner";
import { JoinSection } from "@/features/registration/components/join-section";
import type { JoinPageProps } from "@/types/registration";
import "@/features/registration/styles/join.css";

export async function generateMetadata({ params }: JoinPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("join.title"), description: t("meta.joinDescription") };
}

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <>
            <RegisterBanner index="10" label={t("join.title")} title={t("join.title")} lead={t("join.lead")} mascot={{ src: "/shared/maskot-4.webp", className: "join__mascot" }} />
            <div className="mx-auto w-full max-w-xl px-4 py-12">
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </>
        }
      >
        <JoinSection lang={lang} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
