import type { Metadata } from "next";
import { Geist_Mono, Inter, Orbitron, Space_Grotesk } from "next/font/google";
import { LOCALES } from "@/lib/i18n/config";
import { getDictionary, getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/shared/i18n-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { InstallPromptListener } from "@/components/shared/install-prompt-listener";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

// globals.css maps --font-sans / --font-space-grotesk / --font-geist-mono / --font-display into the theme.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

// Display face for page and section titles (uppercase, weight 800), as in the design.
const orbitron = Orbitron({
  variable: "--font-display",
  weight: ["700", "800"],
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
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = await resolveLang(params);

  return (
    <html lang={lang} className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <I18nProvider lang={lang} dict={getDictionary(lang)}>
          <SiteHeader lang={lang} />
          {children}
          <SiteFooter lang={lang} />
          <InstallPromptListener />
          {/* Light only, like the rest of the app: following the OS theme gave near-white text on the white card. */}
          <Toaster position="top-right" theme="light" />
        </I18nProvider>
      </body>
    </html>
  );
}
