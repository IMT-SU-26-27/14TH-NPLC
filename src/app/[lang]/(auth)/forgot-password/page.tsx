import { languageAlternates } from "@/lib/i18n/alternates";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBand } from "@/components/shared/page-band";
import { AuthFormLoader } from "@/features/auth/components/auth-form-loader";
import "@/features/auth/styles/forgot-password.css";
import { ResetHelpContacts } from "@/features/auth/components/reset-help-contacts";
import type { AuthPageProps } from "@/types/auth";

export async function generateMetadata({ params }: AuthPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("auth.forgotTitle"), description: t("meta.forgotPasswordDescription"), alternates: languageAlternates("/forgot-password") };
}

export default async function ForgotPasswordPage({ params, searchParams }: AuthPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="forgot-password-page flex-1">
      <PageBand index="04" label={t("auth.forgotEyebrow")} title={t("auth.forgotTitle")} lead={t("auth.forgotSubtitle")} mascot={{ src: "/auth/maskot-2.webp" }} />
      <div className="auth-card-area flex justify-center px-4 pt-6 pb-16 sm:pt-10 sm:pb-24">
        <Card className="auth-card w-full max-w-xl px-2 py-8 sm:px-8 sm:py-10">
          <CardHeader>
            <CardTitle className="text-primary font-mono text-sm font-medium tracking-[0.2em] uppercase">
              {"//"} {t("auth.forgotCard")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Suspense fallback={<Skeleton className="h-36 w-full" />}>
              <AuthFormLoader mode="forgot" lang={lang} searchParams={searchParams} />
            </Suspense>
            <ResetHelpContacts lang={lang} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
