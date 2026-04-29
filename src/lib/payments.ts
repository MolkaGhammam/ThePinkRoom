import type { Payment, PaymentBadge } from "@/types/domain";

// Compute the at-a-glance badge from the appointment's payment rows + its total cost.
// Per spec §6.8:
//   unpaid    — net sum is 0 and no rows
//   deposit   — net sum > 0 but < total
//   paid      — net sum >= total
//   refunded  — at least one refund row exists AND net sum == 0
export function computePaymentBadge(
  payments: Payment[],
  appointmentTotal: number,
): { badge: PaymentBadge; paid: number } {
  let net = 0;
  let hasRefund = false;
  for (const p of payments) {
    if (p.deleted_at) continue;
    if (p.status === "paid") net += Number(p.amount);
    else if (p.status === "refunded") {
      net -= Number(p.amount);
      hasRefund = true;
    } else if (p.status === "deposit") {
      net += Number(p.amount);
    }
  }

  if (hasRefund && net <= 0) return { badge: "refunded", paid: 0 };
  if (net <= 0) return { badge: "unpaid", paid: 0 };
  if (net >= appointmentTotal) return { badge: "paid", paid: net };
  return { badge: "deposit", paid: net };
}

export const BADGE_TONE: Record<
  PaymentBadge,
  "muted" | "lavender" | "mint" | "pink"
> = {
  unpaid: "muted",
  deposit: "lavender",
  paid: "mint",
  refunded: "pink",
};
