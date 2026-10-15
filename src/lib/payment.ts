import type { PaymentDetails } from "@/types/competition";

// Participants can only pay (and so register) once the competition's chosen method is fully set up.
export function isPaymentReady(details: PaymentDetails, qrisUrl: string | null): boolean {
  if (details.payment_method === "bank_transfer") return !!details.bank_account_number && !!details.bank_account_holder;
  return !!qrisUrl;
}
