"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRightIcon, ClockIcon, LaptopIcon, MonitorSmartphoneIcon, ShieldXIcon, SmartphoneIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { formatWibTime } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { Button, buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import type { TeamDeviceLockScreenProps } from "@/types/team-device";

const PHONE = /iPhone|iPad|Android/;

// Shown instead of the contest pages on a device that does not hold its team.
export function TeamDeviceLockScreen({ state, movedAway, onRequest }: TeamDeviceLockScreenProps) {
  const { t, lang } = useI18n();
  const [pending, setPending] = useState(false);

  const view = (() => {
    switch (state.status) {
      case "waiting":
        return { icon: <Spinner />, title: "cp.device.waitingTitle", lead: "cp.device.waitingLead", action: null };
      case "rejected":
        return { icon: <ShieldXIcon />, title: "cp.device.rejectedTitle", lead: "cp.device.rejectedLead", action: "cp.device.askAgain" };
      case "expired":
        return { icon: <ClockIcon />, title: "cp.device.expiredTitle", lead: "cp.device.expiredLead", action: "cp.device.askAgain" };
      default:
        return movedAway
          ? { icon: <ArrowLeftRightIcon />, title: "cp.device.movedTitle", lead: "cp.device.movedLead", action: "cp.device.useHere" }
          : { icon: <MonitorSmartphoneIcon />, title: "cp.device.blockedTitle", lead: "cp.device.blockedLead", action: "cp.device.ask" };
    }
  })();

  // Only one request at a time: another device of the team is already asking.
  const otherAsking = state.status === "blocked" && state.requestAt !== null;

  const ask = async () => {
    setPending(true);
    await onRequest();
    setPending(false);
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Empty className="bg-card ring-foreground/10 w-full max-w-md flex-none rounded-xl ring-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">{view.icon}</EmptyMedia>
          <div role="status" aria-live="polite" className="space-y-2">
            <EmptyTitle>
              <h1 className="font-heading text-lg font-semibold">{t(view.title)}</h1>
            </EmptyTitle>
            <EmptyDescription>{t(view.lead)}</EmptyDescription>
          </div>
        </EmptyHeader>
        <EmptyContent className="gap-4">
          <Item variant="outline" className="w-full text-left">
            <ItemMedia variant="icon">{PHONE.test(state.holderLabel ?? "") ? <SmartphoneIcon /> : <LaptopIcon />}</ItemMedia>
            <ItemContent>
              <ItemTitle>{state.holderLabel || t("cp.device.unknownDevice")}</ItemTitle>
              <ItemDescription className="tabular-nums">
                {t("cp.device.holder", {
                  name: state.holderName ?? t("cp.device.someone"),
                  time: state.holderSince ? formatWibTime(state.holderSince, lang) : "–",
                })}
              </ItemDescription>
            </ItemContent>
          </Item>

          {otherAsking && <p className="text-muted-foreground text-sm">{t("cp.device.otherAsking", { name: state.requestName ?? t("cp.device.someone") })}</p>}

          {view.action && (
            <Button className="w-full" disabled={pending || otherAsking} onClick={() => void ask()}>
              {pending && <Spinner />}
              {t(view.action)}
            </Button>
          )}

          {state.status !== "waiting" && <p className="text-muted-foreground text-xs">{t("cp.device.offlineHint")}</p>}

          <Link href={localePath(lang, "/dashboard")} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            {t("cp.device.dashboard")}
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  );
}
