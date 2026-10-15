import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LOCALES } from "@/lib/i18n/config";
import { getDictionary, getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/shared/i18n-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

// globals.css maps --font-sans / --font-geist-mono into the theme.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return {
    title: { default: t("meta.siteName"), template: `%s · ${t("meta.siteName")}` },
    description: t("meta.siteDescription"),
    alternates: { languages: { id: "/id", en: "/en" } },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = await resolveLang(params);

  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <I18nProvider lang={lang} dict={getDictionary(lang)}>
          <SiteHeader lang={lang} />
          {children}
          <SiteFooter lang={lang} />
          <Toaster position="top-right" />
        </I18nProvider>
      </body>
    </html>
  );
}
