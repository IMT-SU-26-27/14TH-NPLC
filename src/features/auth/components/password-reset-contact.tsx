import Link from "next/link";
import { ExternalLinkIcon, MessageCircleIcon } from "lucide-react";
import { getT } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/config";
import { lineProfileUrl, PASSWORD_RESET_CONTACT } from "@/lib/password-reset-contact";
import { buttonVariants } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import type { LangProps } from "@/types/i18n";

export function PasswordResetContact({ lang }: LangProps) {
  const t = getT(lang);
  const { name, lineId } = PASSWORD_RESET_CONTACT;

  return (
    <div className="flex flex-col gap-6">
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>{t("auth.resetSteps.contact")}</li>
        <li>{t("auth.resetSteps.temporary")}</li>
        <li>{t("auth.resetSteps.change")}</li>
      </ol>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <MessageCircleIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{name}</ItemTitle>
          <ItemDescription>{t("auth.contactLineId", { id: lineId })}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <a href={lineProfileUrl(lineId)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t("auth.chatOnLine")}
            <ExternalLinkIcon data-icon="inline-end" />
          </a>
        </ItemActions>
      </Item>
      <p className="text-muted-foreground text-center text-sm">
        {t("auth.rememberPassword")}{" "}
        <Link href={localePath(lang, "/login")} className="underline underline-offset-4 hover:text-primary">
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}
