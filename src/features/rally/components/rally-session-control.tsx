"use client";

import { DoorClosedIcon, DoorOpenIcon, RotateCcwIcon } from "lucide-react";
import { setRallySessionStatus } from "@/lib/actions/admin-rally";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import { useI18n } from "@/hooks/use-i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { RallySessionControlProps, RallySessionStatusButtonProps } from "@/types/rally";

const ICONS = { not_open: RotateCcwIcon, open: DoorOpenIcon, closed: DoorClosedIcon };
const VARIANT = { not_open: "outline", open: "default", closed: "secondary" } as const;

function StatusButton({ competitionId, to }: RallySessionStatusButtonProps) {
  const { t } = useI18n();
  const { open, setOpen, pending, run } = useConfirmAction();
  const Icon = ICONS[to];

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant={to === "open" ? "default" : "outline"} />}>
        <Icon />
        {t(`rally.session.action.${to}`)}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(`rally.session.confirmTitle.${to}`)}</AlertDialogTitle>
          <AlertDialogDescription>{t(`rally.session.confirm.${to}`)}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={() => run(() => setRallySessionStatus(competitionId, to), `rally.session.changed.${to}`)}>
            {pending && <Spinner />}
            {t(`rally.session.action.${to}`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function RallySessionControl({ session }: RallySessionControlProps) {
  const { t } = useI18n();
  const others = (["open", "closed", "not_open"] as const).filter((s) => s !== session.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("rally.session.title")}</CardTitle>
        <CardDescription>{t("rally.session.lead")}</CardDescription>
        <CardAction>
          <Badge variant={VARIANT[session.status]}>{t(`rally.session.status.${session.status}`)}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {others.map((to) => (
          <StatusButton key={to} competitionId={session.competition_id} to={to} />
        ))}
      </CardContent>
    </Card>
  );
}
