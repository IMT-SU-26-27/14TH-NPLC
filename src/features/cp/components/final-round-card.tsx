"use client";

import { useState, useTransition } from "react";
import { EyeIcon, EyeOffIcon, FlagIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { saveFinalists, setFinalistsAnnounced, startFinalRound } from "@/lib/actions/admin-cp";
import { formatScore } from "@/lib/format";
import { CP_FINALIST_COUNT } from "@/lib/validations/cp";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActionResult } from "@/types";
import type { FinalRoundCardProps } from "@/types/cp";

// After the preliminary: pick the finalists (the top 15 are suggested, disqualified teams never), announce them to
// the teams, then start the final, which archives the preliminary standings and resets every score.
export function FinalRoundCard({ contest, standings, finalistIds, disqualifiedIds }: FinalRoundCardProps) {
  const { t, lang } = useI18n();
  const { session } = contest;
  const disqualified = new Set(disqualifiedIds);
  const [picked, setPicked] = useState<Set<string>>(
    () =>
      new Set(
        finalistIds.length > 0
          ? finalistIds
          : standings.filter((row) => !disqualified.has(row.registration_id)).slice(0, CP_FINALIST_COUNT).map((row) => row.registration_id),
      ),
  );
  const [pending, startTransition] = useTransition();
  const start = useConfirmAction();

  const saved = new Set(finalistIds);
  const unsaved = picked.size !== saved.size || [...picked].some((id) => !saved.has(id));
  const announced = !!session.finalists_announced_at;
  const canPick = session.round === "preliminary" && session.status === "ended";

  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(t(result.message ?? "admin.cp.final.saved"));
      else toast.error(t(result.message));
    });
  }

  function toggle(id: string, checked: boolean) {
    setPicked((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (session.round === "final") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("admin.cp.final.title")}
            <Badge>{t("admin.cp.round.final")}</Badge>
          </CardTitle>
          <CardDescription>{t("admin.cp.final.running", { count: finalistIds.length })}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.cp.final.title")}</CardTitle>
        <CardDescription>{canPick ? t("admin.cp.final.lead", { count: CP_FINALIST_COUNT }) : t("admin.cp.final.endFirst")}</CardDescription>
      </CardHeader>
      {canPick && (
        <>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <span className="sr-only">{t("admin.cp.final.pick")}</span>
                  </TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{t("cp.team")}</TableHead>
                  <TableHead className="text-right">{t("cp.totalPoints")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((row, index) => {
                  const isDisqualified = disqualified.has(row.registration_id);
                  const id = `finalist-${row.registration_id}`;
                  return (
                    <TableRow key={row.registration_id}>
                      <TableCell>
                        <Checkbox
                          id={id}
                          checked={picked.has(row.registration_id)}
                          disabled={isDisqualified || pending}
                          onCheckedChange={(checked) => toggle(row.registration_id, checked === true)}
                        />
                      </TableCell>
                      <TableCell className="tabular-nums">{index + 1}</TableCell>
                      <TableCell>
                        <label htmlFor={id} className="inline-flex items-center gap-2 font-medium">
                          {row.team_name}
                          {isDisqualified && <Badge variant="destructive">{t("admin.detail.disqualifiedBadge")}</Badge>}
                        </label>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatScore(Number(row.total_points), lang)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground mr-auto text-sm">
              {t("admin.cp.final.picked", { count: picked.size })}
              {unsaved && ` · ${t("admin.cp.final.unsaved")}`}
            </span>
            <Button variant="outline" disabled={pending || !unsaved} onClick={() => run(() => saveFinalists(contest.competitionId, [...picked]))}>
              {pending ? <Spinner /> : <SaveIcon />}
              {t("admin.cp.final.save")}
            </Button>
            <Button
              variant="outline"
              disabled={pending || unsaved || saved.size === 0}
              onClick={() => run(() => setFinalistsAnnounced(contest.competitionId, !announced))}
            >
              {announced ? <EyeOffIcon /> : <EyeIcon />}
              {announced ? t("admin.cp.final.hide") : t("admin.cp.final.announce")}
            </Button>
            <AlertDialog open={start.open} onOpenChange={start.setOpen}>
              <AlertDialogTrigger render={<Button disabled={pending || unsaved || saved.size === 0} />}>
                <FlagIcon />
                {t("admin.cp.final.start")}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("admin.cp.final.startTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("admin.cp.final.startDescription", { count: saved.size })}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={start.pending}>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction disabled={start.pending} onClick={() => start.run(() => startFinalRound(contest.competitionId), "admin.cp.final.started")}>
                    {start.pending && <Spinner />}
                    {t("admin.cp.final.start")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
