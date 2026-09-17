import type Stripe from "https://esm.sh/stripe@14.21.0";
import { partnerPassForAmount } from "./price-tier-map.ts";

/**
 * Partner sponsorships are routinely invoiced and paid by check or bank
 * transfer instead of bought through Checkout. Those payments fire
 * `invoice.paid`, never `checkout.session.completed`, so nothing ever wrote
 * them to `purchases` — the partner showed as unpaid on the admin dashboard
 * and their money was missing from the revenue totals.
 *
 * Invoices are recorded under their own Stripe id in `stripe_session_id`. The
 * column is a free-text identifier with no unique constraint, and prefixes keep
 * the two sources distinguishable: `cs_...` for Checkout, `in_...` for invoices.
 */

export interface InvoicePurchaseRow {
  email: string;
  name: string | null;
  stripe_session_id: string;
  stripe_payment_link_id: string | null;
  amount: number;
  currency: string;
  pass_type: string;
  tier: string;
  quantity: number;
  purchased_at: string;
}

/**
 * Build the purchase row for a paid invoice, or null when it is not a partner
 * sponsorship. Only amounts matching a partner tier are recognised, so ordinary
 * invoices cannot accidentally register someone as an attendee.
 */
export const invoiceToPurchase = (
  invoice: Stripe.Invoice,
): InvoicePurchaseRow | null => {
  const amount = invoice.amount_paid ?? 0;
  if (amount <= 0) return null;

  // Match on the line item first: a multi-line invoice's total would not equal
  // any single tier price, but each sponsorship line still does.
  const lines: Stripe.InvoiceLineItem[] = invoice.lines?.data ?? [];
  const lineAmounts: number[] = lines
    .map((line: Stripe.InvoiceLineItem) => line.amount ?? 0)
    .filter((value: number) => value > 0);
  const info = partnerPassForAmount(amount) ??
    lineAmounts.map(partnerPassForAmount).find(Boolean) ??
    null;
  if (!info) return null;

  const email = (invoice.customer_email ?? "").trim().toLowerCase();
  if (!email) return null;

  const paidAt = invoice.status_transitions?.paid_at ?? invoice.created;

  return {
    email,
    name: invoice.customer_name ?? null,
    stripe_session_id: invoice.id,
    stripe_payment_link_id: null,
    amount,
    currency: invoice.currency ?? "usd",
    pass_type: info.passType,
    tier: info.tier,
    quantity: 1,
    purchased_at: new Date(paidAt * 1000).toISOString(),
  };
};
