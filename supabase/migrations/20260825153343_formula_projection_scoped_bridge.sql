-- Narrow Firebase-to-Lovable Cloud bridge for Formula access projections.
--
-- The Firebase projector intentionally does not receive the Supabase
-- service-role key. It authenticates with a dedicated high-entropy secret
-- stored in Vault and may invoke only these three outbox operations.

create or replace function formula_private.verify_projection_bridge_secret(
  p_integration_secret text
)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if p_integration_secret is null
     or char_length(p_integration_secret) not between 32 and 512
     or not exists (
       select 1
         from vault.decrypted_secrets secret
        where secret.name = 'formula_projection_firebase_bridge'
          and secret.decrypted_secret = p_integration_secret
     ) then
    raise exception using errcode = '42501', message = 'formula_projection_bridge_unauthorized';
  end if;
end;
$function$;

revoke all on function formula_private.verify_projection_bridge_secret(text)
  from public, anon, authenticated;

create or replace function public.formula_bridge_claim_projection_outbox_batch(
  p_integration_secret text,
  p_worker_id text,
  p_batch_size integer,
  p_lease_seconds integer
)
returns table (
  outbox_id uuid,
  event_registration_id uuid,
  projection_version bigint,
  revocation_version bigint,
  target_path text,
  payload_text text,
  payload_sha256 text,
  lease_token uuid,
  attempt_count integer,
  lease_expires_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $function$
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  return query
    select *
      from public.formula_claim_projection_outbox_batch(
        p_worker_id,
        p_batch_size,
        p_lease_seconds
      );
end;
$function$;

create or replace function public.formula_bridge_complete_projection_outbox(
  p_integration_secret text,
  p_outbox_id uuid,
  p_lease_token uuid,
  p_payload_sha256 text,
  p_result_code text
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $function$
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  return public.formula_complete_projection_outbox(
    p_outbox_id,
    p_lease_token,
    p_payload_sha256,
    p_result_code
  );
end;
$function$;

create or replace function public.formula_bridge_fail_projection_outbox(
  p_integration_secret text,
  p_outbox_id uuid,
  p_lease_token uuid,
  p_payload_sha256 text,
  p_error_code text,
  p_retryable boolean,
  p_retry_after_seconds integer
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $function$
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  return public.formula_fail_projection_outbox(
    p_outbox_id,
    p_lease_token,
    p_payload_sha256,
    p_error_code,
    p_retryable,
    p_retry_after_seconds
  );
end;
$function$;

revoke execute on function public.formula_bridge_claim_projection_outbox_batch(text, text, integer, integer)
  from public, authenticated;
revoke execute on function public.formula_bridge_complete_projection_outbox(text, uuid, uuid, text, text)
  from public, authenticated;
revoke execute on function public.formula_bridge_fail_projection_outbox(text, uuid, uuid, text, text, boolean, integer)
  from public, authenticated;

grant execute on function public.formula_bridge_claim_projection_outbox_batch(text, text, integer, integer)
  to anon, service_role;
grant execute on function public.formula_bridge_complete_projection_outbox(text, uuid, uuid, text, text)
  to anon, service_role;
grant execute on function public.formula_bridge_fail_projection_outbox(text, uuid, uuid, text, text, boolean, integer)
  to anon, service_role;
