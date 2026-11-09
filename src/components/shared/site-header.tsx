import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { homeSectionLinks } from "@/lib/home-sections";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderActions } from "@/components/shared/header-actions";
import type { LangProps } from "@/types/i18n";

export function SiteHeader({ lang }: LangProps) {
  const t = getT(lang);

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 min-[360px]:gap-4">
        <Link href={localePath(lang, "/")} className="inline-flex shrink-0 items-center gap-2">
          <Image src="/shared/logo-star.webp" alt="" aria-hidden width={21} height={26} preload className="h-[22px] w-auto sm:h-[26px]" />
          <Image
            src="/shared/logo-nplc-xiv.webp"
            alt={t("meta.siteName")}
            width={128}
            height={26}
            preload
            className="h-5 w-auto min-[360px]:h-6.5"
          />
        </Link>
        <Suspense fallback={<Skeleton className="h-8 w-48" />}>
          <HeaderActions lang={lang} sections={homeSectionLinks(lang, t)} />
        </Suspense>
      </div>
    </header>
  );
}
