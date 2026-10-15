"use client";

import { Trash2Icon } from "lucide-react";
import { deleteRegistration } from "@/lib/actions/registration";
import { useConfirmAction } from "@/hooks/use-confirm-action";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { DeleteTeamButtonProps } from "@/types/registration";

export function DeleteTeamButton({ registrationId }: DeleteTeamButtonProps) {
  const { open, setOpen, pending, run } = useConfirmAction();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Trash2Icon />
        Delete team
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this team?</AlertDialogTitle>
          <AlertDialogDescription>
            Everyone is removed and the team code stops working. You can register a new team afterwards.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={() => run(() => deleteRegistration(registrationId), "Team deleted")}>
            {pending && <Spinner />}
            Delete team
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
