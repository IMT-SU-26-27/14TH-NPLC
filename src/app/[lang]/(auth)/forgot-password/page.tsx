import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordResetContact } from "@/features/auth/components/password-reset-contact";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("auth.forgotTitle"), description: t("meta.forgotPasswordDescription") };
}

export default async function ForgotPasswordPage({ params }: LangPageProps) {
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
          <PasswordResetContact lang={lang} />
        </CardContent>
      </Card>
    </main>
  );
}
