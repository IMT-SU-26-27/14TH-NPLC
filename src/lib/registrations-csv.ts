import { getT } from "@/lib/i18n/get-dictionary";
import type { RegistrationExportRow } from "@/types/admin";
import type { Locale } from "@/types/i18n";

const wibFormat = new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jakarta" });

function wib(value: string | null): string {
  return value ? wibFormat.format(new Date(value)) : "";
}

// Quotes every cell. A cell starting with = + - @ would run as a formula in Sheets/Excel, so it gets a leading '.
function cell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

// Phone numbers as a text formula, so Sheets and Excel keep the leading 0 or +62.
function phone(value: string | null): string {
  return value ? `"=""${value.replaceAll('"', "")}"""` : '""';
}

export function registrationsCsv(rows: RegistrationExportRow[], lang: Locale): string {
  const t = getT(lang);
  const h = (key: string) => cell(t(`admin.registrations.csv.${key}`));
  const header = ["no", "team", "competition", "school", "status", "leader", "email", "phone", "members", "payer", "paidAt", "proofFile", "registeredAt", "code"].map(h);

  const lines = rows.map((r, i) =>
    [
      cell(i + 1),
      cell(r.team_name),
      cell(r.competition_name),
      cell(r.school),
      cell(r.status ? t(`status.${r.status}`) : ""),
      cell(r.leader_name),
      cell(r.leader_email),
      phone(r.leader_phone),
      cell(r.member_count),
      cell(r.payer_name),
      cell(wib(r.payment_submitted_at)),
      cell(r.proof_file),
      cell(wib(r.created_at)),
      cell(r.referral_code),
    ].join(","),
  );
  // BOM so Excel reads the UTF-8 names correctly.
  return `﻿${[header.join(","), ...lines].join("\r\n")}`;
}
