import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthFormLoader } from "@/features/auth/components/auth-form-loader";
import { AuthHero } from "@/features/auth/components/auth-hero";
import "@/features/auth/styles/signup.css";
import type { AuthPageProps } from "@/types/auth";

export async function generateMetadata({ params }: AuthPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("auth.signupTitle"), description: t("meta.signupDescription") };
}

export default async function SignupPage({ params, searchParams }: AuthPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="signup-page flex-1">
      <AuthHero step="03" eyebrow={t("auth.signupTitle")} title={t("auth.signupTitle")} subtitle={t("auth.signupSubtitle")} mascot="/auth/maskot-1.webp" />
      <div className="flex justify-center px-4 pt-6 pb-16 sm:pt-10 sm:pb-24">
        <Card className="w-full max-w-xl px-2 py-8 sm:px-8 sm:py-10">
          <CardHeader>
            <CardTitle className="text-primary font-mono text-sm font-medium tracking-[0.2em] uppercase">
              {"//"} {t("auth.signupCard")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <AuthFormLoader mode="signup" lang={lang} searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
