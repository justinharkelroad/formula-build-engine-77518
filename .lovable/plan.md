# Stripe live-connection verification (read-only)

Nothing was modified. Results below.

## Verified ready

- **Secrets present in Lovable Cloud**: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` both exist (values not read or shown). The Stripe key is a **live-mode** key (verified by an authenticated read-only Stripe account call).
- **Function deployed**: `stripe-webhook-enhanced` responds at its public URL; an unsigned POST returns `400 Missing signature`.
- **Signature verification**: the function requires the `stripe-signature` header and verifies it with `constructEventAsync` against `STRIPE_WEBHOOK_SECRET`; failures return 400 and nothing is written.
- **Event handling**: the code accepts `checkout.session.completed` and `checkout.session.async_payment_succeeded`, ignores all other types, and skips sessions that are not `payment_status = paid`.
- **Live traffic already landing**: real `cs_live_…` purchases were recorded as recently as Aug 20, so the endpoint secret in Cloud matches the Stripe endpoint.
- **Webhook endpoint URL** (the one configured in Stripe):
  `https://koubtooblwjcwubcuhml.supabase.co/functions/v1/stripe-webhook-enhanced`
- **Required event types**: `checkout.session.completed`, `checkout.session.async_payment_succeeded`.

## Remaining launch gate

**One gate, in the Stripe dashboard only:** the live endpoint above currently has **only `checkout.session.completed` enabled**. Add `checkout.session.async_payment_succeeded` to that endpoint, otherwise delayed-settlement payments (bank debits, some wallets) never produce a purchase record or a confirmation email.

Note, not a gate: two other live endpoints also receive `checkout.session.completed` — an old Google Cloud Function (`…cloudfunctions.net/stripeWebhook`) and a duplicated Make.com hook (listed twice). They do not block launch, but they mean the same payment is processed by legacy systems in parallel; worth disabling if they are no longer wanted.

## Observed logs

No recent `stripe-webhook-enhanced` invocations are inside the retained log window, so there are no success/failure entries to report from the new transactional email release. The delivery queue currently contains only the four earlier test rows (all `delivered`); no real Stripe purchase has run through the queue since it was deployed.
