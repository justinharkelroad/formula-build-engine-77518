create table if not exists public.purchase_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null,
  email_type text not null check (email_type in ('attendee_confirmation', 'partner_welcome')),
  recipient_email text not null,
  recipient_name text,
  tier text,
  status text not null default 'queued' check (
    status in ('queued','sending','sent','delivered','delivery_delayed','bounced','complained','suppressed','failed')
  ),
  provider_email_id text,
  idempotency_key text not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 6 check (max_attempts > 0),
  next_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stripe_session_id, email_type)
);

create unique index if not exists purchase_email_deliveries_provider_id_idx
  on public.purchase_email_deliveries (provider_email_id)
  where provider_email_id is not null;

create index if not exists purchase_email_deliveries_retry_idx
  on public.purchase_email_deliveries (next_attempt_at)
  where status in ('queued', 'failed');

create table if not exists public.purchase_email_delivery_events (
  id uuid primary key default gen_random_uuid(),
  svix_id text not null unique,
  provider_email_id text,
  event_type text not null,
  event_created_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

create index if not exists purchase_email_delivery_events_provider_id_idx
  on public.purchase_email_delivery_events (provider_email_id);

alter table public.purchase_email_deliveries enable row level security;
alter table public.purchase_email_delivery_events enable row level security;

drop policy if exists "Admins can view purchase email deliveries" on public.purchase_email_deliveries;
create policy "Admins can view purchase email deliveries"
  on public.purchase_email_deliveries
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Admins can view purchase email delivery events" on public.purchase_email_delivery_events;
create policy "Admins can view purchase email delivery events"
  on public.purchase_email_delivery_events
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

revoke all on public.purchase_email_deliveries from anon;
revoke all on public.purchase_email_delivery_events from anon;
revoke insert, update, delete, truncate, references, trigger on public.purchase_email_deliveries from authenticated;
revoke insert, update, delete, truncate, references, trigger on public.purchase_email_delivery_events from authenticated;
grant select on public.purchase_email_deliveries to authenticated;
grant select on public.purchase_email_delivery_events to authenticated;
grant all on public.purchase_email_deliveries to service_role;
grant all on public.purchase_email_delivery_events to service_role;

comment on table public.purchase_email_deliveries is 'Durable transactional email outbox for Stripe ticket and partner purchases.';
comment on table public.purchase_email_delivery_events is 'Verified Resend delivery webhook events used for audit and status updates.';