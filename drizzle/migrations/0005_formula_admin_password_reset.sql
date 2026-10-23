-- Admin "Forgot password?" emails, sent through Resend from
-- tickets@theformulaforum.com by the formula-admin-password-reset function.
--
-- Lovable Cloud's built-in auth mailer accepted reset requests but the emails
-- did not reach admin inboxes, so the reset link is minted with the auth
-- admin API (which sends nothing itself) and mailed like ticket emails.
--
-- Only website admins are sent a link. Every request is logged and
-- rate-limited the same way whether or not the email is an admin, so the
-- endpoint cannot be used to find out who has an admin account. No reset
-- token is stored here. Rows older than a day are deleted on each request.

create table formula_private.admin_password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  normalized_email text not null,
  client_hash text not null check (client_hash ~ '^[0-9a-f]{64}$'),
  outcome text not null default 'pending'
    check (outcome in ('pending', 'sent', 'send_failed', 'not_admin', 'rate_limited')),
  created_at timestamptz not null default now()
);

create index admin_password_reset_requests_email_time
  on formula_private.admin_password_reset_requests(normalized_email, created_at desc);
create index admin_password_reset_requests_client_time
  on formula_private.admin_password_reset_requests(client_hash, created_at desc);

-- Gate for one reset request. The caller must give every outcome except
-- invalid_email and rate_limited the same public reply.
create or replace function public.formula_admin_reset_request(p_email text, p_client_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_outcome text;
  v_request_id uuid;
begin
  if length(v_email) > 254 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return jsonb_build_object('send', false, 'outcome', 'invalid_email');
  end if;
  if p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'formula_admin_reset_invalid_client';
  end if;

  delete from formula_private.admin_password_reset_requests r where r.created_at < now() - interval '1 day';

  if (select count(*) from formula_private.admin_password_reset_requests r
       where r.normalized_email = v_email and r.created_at > now() - interval '15 minutes') >= 3
     or (select count(*) from formula_private.admin_password_reset_requests r
       where r.normalized_email = v_email) >= 10
     or (select count(*) from formula_private.admin_password_reset_requests r
       where r.client_hash = p_client_hash and r.created_at > now() - interval '1 hour') >= 10 then
    v_outcome := 'rate_limited';
  elsif exists (
    select 1
      from auth.users u
      join public.user_roles ur on ur.user_id = u.id and ur.role = 'admin'
      where lower(u.email) = v_email
  ) then
    v_outcome := 'pending';
  else
    v_outcome := 'not_admin';
  end if;

  insert into formula_private.admin_password_reset_requests (normalized_email, client_hash, outcome)
  values (v_email, p_client_hash, v_outcome)
  returning id into v_request_id;

  return jsonb_build_object(
    'send', v_outcome = 'pending',
    'outcome', v_outcome,
    'requestId', v_request_id,
    'email', v_email
  );
end;
$$;

create or replace function public.formula_admin_reset_record(p_request_id uuid, p_sent boolean)
returns void
language sql
security definer
set search_path = ''
as $$
  update formula_private.admin_password_reset_requests
     set outcome = case when p_sent then 'sent' else 'send_failed' end
   where id = p_request_id and outcome = 'pending';
$$;

revoke all on table formula_private.admin_password_reset_requests from public, anon, authenticated;
alter table formula_private.admin_password_reset_requests enable row level security;

revoke all on function public.formula_admin_reset_request(text, text) from public, anon, authenticated;
revoke all on function public.formula_admin_reset_record(uuid, boolean) from public, anon, authenticated;
grant execute on function public.formula_admin_reset_request(text, text) to service_role;
grant execute on function public.formula_admin_reset_record(uuid, boolean) to service_role;
