import type { PaymentDetails } from "@/types/competition";

// Participants can only pay (and so register) once the competition's chosen method is fully set up.
export function isPaymentReady(details: PaymentDetails, qrisUrl: string | null): boolean {
  if (details.payment_method === "bank_transfer") return !!details.bank_account_number && !!details.bank_account_holder;
  return !!qrisUrl;
}

// Finance (19 Nov 2026): every transfer adds this unique code to the fee, so NPLC payments stand out in the
// foundation's bank statement (Rp 85.000 is sent as Rp 85.002). The same code for every team.
export const PAYMENT_UNIQUE_CODE = 2;

export function transferAmount(fee: number): number {
  return fee + PAYMENT_UNIQUE_CODE;
}

// The transfer note finance asks for: NPLC-<team leader's name>.
export function transferNote(leaderName: string): string {
  return `NPLC-${leaderName.trim()}`;
}
