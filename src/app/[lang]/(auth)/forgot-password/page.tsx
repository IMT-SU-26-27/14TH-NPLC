import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthFormLoader } from "@/features/auth/components/auth-form-loader";
import type { AuthPageProps } from "@/types/auth";

export async function generateMetadata({ params }: AuthPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("auth.forgotTitle"), description: t("meta.forgotPasswordDescription") };
}

export default async function ForgotPasswordPage({ params, searchParams }: AuthPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">{t("auth.forgotTitle")}</CardTitle>
          <CardDescription>{t("auth.forgotSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-36 w-full" />}>
            <AuthFormLoader mode="forgot" lang={lang} searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
