import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthBackdrop } from "@/features/auth/components/auth-backdrop";
import { AuthFormLoader } from "@/features/auth/components/auth-form-loader";
import type { AuthPageProps } from "@/types/auth";

export async function generateMetadata({ params }: AuthPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("auth.signupTitle"), description: t("meta.signupDescription") };
}

export default async function SignupPage({ params, searchParams }: AuthPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <AuthBackdrop mascot="signup">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{t("auth.signupTitle")}</CardTitle>
          <CardDescription>{t("auth.signupSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <AuthFormLoader mode="signup" lang={lang} searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </AuthBackdrop>
  );
}
