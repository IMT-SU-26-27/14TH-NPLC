"use client";

import { useRouter } from "next/navigation";
import { TableRow } from "@/components/ui/table";
import type { RegistrationRowProps } from "@/types/admin";

// A click anywhere on the row opens the team. Done in JS because a link stretched over a <tr> with CSS escapes the
// row in some browsers and covers the whole table, so every click opened the last team.
export function RegistrationRow({ href, children }: RegistrationRowProps) {
  const router = useRouter();
  return (
    <TableRow
      className="cursor-pointer"
      onClick={(event) => {
        // Links and buttons in the row keep their own target; selecting text (e.g. copying an email) opens nothing.
        if ((event.target as HTMLElement).closest("a, button") || window.getSelection()?.toString()) return;
        router.push(href);
      }}
    >
      {children}
    </TableRow>
  );
}
