import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBand } from "@/components/shared/page-band";
import { AuthFormLoader } from "@/features/auth/components/auth-form-loader";
import "@/features/auth/styles/login.css";
import type { AuthPageProps } from "@/types/auth";

export async function generateMetadata({ params }: AuthPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("auth.signInTitle"), description: t("meta.loginDescription") };
}

export default async function LoginPage({ params, searchParams }: AuthPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="login-page flex-1">
      <PageBand index="02" label={t("auth.signInTitle")} title={t("auth.signInTitle")} lead={t("auth.signInSubtitle")} mascot={{ src: "/auth/maskot-2.webp" }} />
      <div className="auth-card-area flex justify-center px-4 pt-6 pb-16 sm:pt-10 sm:pb-24">
        <Card className="auth-card w-full max-w-xl px-2 py-8 sm:px-8 sm:py-10">
          <CardHeader>
            <CardTitle className="text-primary font-mono text-sm font-medium tracking-[0.2em] uppercase">
              {"//"} {t("auth.signInCard")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
              <AuthFormLoader mode="login" lang={lang} searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
