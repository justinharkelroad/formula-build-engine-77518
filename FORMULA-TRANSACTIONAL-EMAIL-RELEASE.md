# FORMULA transactional email release

Status: Code is ready for review. Nothing in this checklist has been applied to production.

## What changes

The Stripe purchase webhook records a durable email job and sends it through Resend. A scheduled worker retries API failures. A verified Resend webhook records delivered, delayed, bounced, complained, suppressed, and failed events. The admin sales screen shows the latest status and can resend attendee or partner emails.

The confirmation page also contains the hotel, iPhone app, attendee group, event, and contact links. It remains useful when an inbox provider delays or filters the email.

## Lovable Cloud release target

Formula uses Lovable Cloud as its managed backend. The `koubtooblwjcwubcuhml` identifier in the repository is the Supabase-compatible endpoint for that Lovable Cloud project. It is not a separately managed Supabase project.

The connected Supabase account is not part of this release and should not be used. All database, function, secret, test, and production steps happen in the Formula Lovable project.

In Lovable Cloud, confirm the current environment contains the real Formula records:

```sql
select count(*) as purchases from public.purchases;
select count(*) as partner_profiles from public.partner_profiles;
```

Open Cloud, then Database, and run the count in the SQL editor. If Test and Live environments are enabled, confirm the Live database first and perform all development testing in Test.

## Resend setup

1. Verify the sending domain `theformulaforum.com` in the existing Resend account.
2. Confirm the exact From address. The code defaults to `FORMULA <tickets@theformulaforum.com>`.
3. Add these Edge Function secrets under Formula Lovable Cloud, then Cloud, then Secrets:

```text
RESEND_API_KEY
RESEND_WEBHOOK_SECRET
EMAIL_WORKER_SECRET
FORMULA_EMAIL_FROM
FORMULA_EMAIL_REPLY_TO
```

Recommended values for the two nonsecret identity settings:

```text
FORMULA_EMAIL_FROM=FORMULA <tickets@theformulaforum.com>
FORMULA_EMAIL_REPLY_TO=info@f3florida.com
```

Generate `EMAIL_WORKER_SECRET` as a new random value. Do not reuse a Stripe, Lovable Cloud, or Resend secret.

Lovable Cloud secrets are environment-specific. If Test and Live environments are enabled, add the required secrets to both environments. Publishing syncs application code and safe database schema changes, but it does not copy secrets or other Cloud configuration from Test to Live.

## Database and function release order

1. Sync the branch into the Formula Lovable project through its connected GitHub repository.
2. In the Lovable Test environment, confirm that `supabase/migrations/20260821124211_formula_email_deliveries.sql` created the delivery tables and admin-only policies.
3. Confirm Lovable Cloud deployed these functions in Test:
   - `stripe-webhook-enhanced`
   - `process-email-deliveries`
   - `resend-webhook`
   - `send-partner-welcome`
   - `test-confirmation-email`
   - `reprocess-purchases`
4. In Resend, create a webhook using the Test `resend-webhook` URL shown by Lovable Cloud.
5. Subscribe it to:
   - `email.sent`
   - `email.delivered`
   - `email.delivery_delayed`
   - `email.bounced`
   - `email.complained`
   - `email.suppressed`
   - `email.failed`
6. Save the Test webhook signing secret in the Test Cloud environment as `RESEND_WEBHOOK_SECRET`.
7. Confirm the Stripe test endpoint subscribes to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
8. In Lovable Cloud, schedule `process-email-deliveries` every five minutes. The scheduled request must send `EMAIL_WORKER_SECRET` in the `x-email-worker-secret` header.
9. Complete the Test environment matrix below.
10. Run the Lovable security scan and resolve any critical findings.
11. Add the production Resend webhook, webhook secret, and worker schedule in Live. Test and Live webhook signing secrets can differ.
12. Justin reviews the Publish dialog and selects Publish changes. Publishing syncs the application code, Edge Functions, and safe schema migration to Live. It does not copy Test data or Test secrets.

## Test matrix before publishing

Use Stripe test mode and a Resend test recipient first.

1. Complete one attendee checkout.
2. Confirm one `purchases` record per line item.
3. Confirm exactly one `attendee_confirmation` delivery for the Stripe session.
4. Replay the same Stripe event. Confirm there is still one purchase set and one delivery.
5. Confirm Resend shows the message and the database moves from `sent` to `delivered`.
6. Use the admin Resend button. Confirm it creates a new idempotency key and sends once.
7. Temporarily test an invalid Resend key in a nonproduction environment. Confirm status becomes `failed`, `last_error` is populated, and the retry time advances.
8. Repeat with a partner checkout. Confirm the partner onboarding link is correct.
9. Open the thank you page on mobile and desktop. Confirm the hotel, iPhone app, Facebook group, email, and phone links work.

## Existing purchasers

Start with a count only:

```sql
select
  count(distinct stripe_session_id) filter (where pass_type <> 'partner') as attendee_sessions,
  count(distinct stripe_session_id) filter (where pass_type = 'partner') as partner_sessions
from public.purchases;
```

Do not mass send automatically. First create dormant outbox rows with a future retry date:

```sql
insert into public.purchase_email_deliveries (
  stripe_session_id,
  email_type,
  recipient_email,
  recipient_name,
  tier,
  idempotency_key,
  next_attempt_at
)
select distinct on (p.stripe_session_id)
  p.stripe_session_id,
  case when p.pass_type = 'partner' then 'partner_welcome' else 'attendee_confirmation' end,
  lower(p.email),
  p.name,
  p.tier,
  'formula:' || p.stripe_session_id || ':' ||
    case when p.pass_type = 'partner' then 'partner_welcome' else 'attendee_confirmation' end ||
    ':backfill-v1',
  '2099-01-01T00:00:00Z'::timestamptz
from public.purchases p
order by p.stripe_session_id, (p.pass_type = 'partner') desc, p.created_at
on conflict (stripe_session_id, email_type) do nothing;
```

Review the recipients in Admin Sales. Individual messages can then be sent with the Resend button. Any bulk activation requires a separate approval and a defined purchaser date range.

## Rollback

If sending misbehaves, disable the Stripe webhook endpoint or redeploy the previous Stripe function. Do not drop the delivery tables. They are the audit record needed to identify which customers were sent, delivered, delayed, or failed.

## SMS phase two

Do not add SMS until checkout collects a mobile number and explicit transactional messaging consent. Then choose the sender, opt out language, retry behavior, and whether SMS is a fallback or a second confirmation. Email is the approved first release.
