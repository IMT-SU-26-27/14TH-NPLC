import "server-only";
import ExcelJS from "exceljs";
import { getT } from "@/lib/i18n/get-dictionary";
import type { RegistrationExportRow } from "@/types/admin";
import type { Locale } from "@/types/i18n";

const wibFormat = new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jakarta" });

function wib(value: string | null): string {
  return value ? wibFormat.format(new Date(value)) : "";
}

const COLUMNS = [
  ["no", 5],
  ["team", 24],
  ["competition", 24],
  ["school", 28],
  ["status", 20],
  ["leader", 24],
  ["email", 30],
  ["phone", 16],
  ["members", 10],
  ["payer", 24],
  ["paidAt", 18],
  ["proofFile", 30],
  ["registeredAt", 18],
  ["code", 12],
] as const;

// Every team as an .xlsx workbook, returned base64 so a Server Action can hand it to the browser. Cells are written
// as text or numbers (never formulas), so team names cannot run as formulas and phone numbers keep their leading 0.
export async function registrationsXlsx(rows: RegistrationExportRow[], lang: Locale): Promise<string> {
  const t = getT(lang);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(t("admin.registrations.title"), { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = COLUMNS.map(([key, width]) => ({ header: t(`admin.registrations.csv.${key}`), key, width }));
  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };

  rows.forEach((r, i) =>
    sheet.addRow({
      no: i + 1,
      team: r.team_name ?? "",
      competition: r.competition_name ?? "",
      school: r.school ?? "",
      status: r.status ? t(`status.${r.status}`) : "",
      leader: r.leader_name ?? "",
      email: r.leader_email ?? "",
      phone: r.leader_phone ?? "",
      members: r.member_count ?? "",
      payer: r.payer_name ?? "",
      paidAt: wib(r.payment_submitted_at),
      proofFile: r.proof_file ?? "",
      registeredAt: wib(r.created_at),
      code: r.referral_code ?? "",
    }),
  );

  return Buffer.from(await workbook.xlsx.writeBuffer()).toString("base64");
}
