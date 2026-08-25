-- Increment 7B: service-only, leased draining for Formula access projections.
-- The existing payload, hash, target, and monotonic versions remain authoritative.

alter table formula_private.projection_outbox
  add column lease_token uuid null,
  add column leased_by text null,
  add column lease_expires_at timestamptz null,
  add column last_attempt_at timestamptz null,
  add column result_code text null;

-- A pre-existing unleased processing row cannot identify a current owner.
-- Preserve it and make it safely retryable before enforcing lease shape.
update formula_private.projection_outbox
   set state = 'failed',
       next_attempt_at = now(),
       last_error_code = 'lease_conflict',
       result_code = 'lease_conflict',
       updated_at = now()
 where state = 'processing';

alter table formula_private.projection_outbox
  add constraint formula_projection_outbox_lease_shape check (
    (
      state = 'processing'
      and lease_token is not null
      and leased_by is not null
      and leased_by = btrim(leased_by)
      and char_length(leased_by) between 1 and 128
      and lease_expires_at is not null
      and last_attempt_at is not null
      and lease_expires_at > last_attempt_at
    )
    or (
      state <> 'processing'
      and lease_token is null
      and leased_by is null
      and lease_expires_at is null
    )
  ),
  add constraint formula_projection_outbox_result_code_bounded check (
    result_code is null
    or result_code in (
      'applied',
      'idempotent',
      'superseded',
      'superseded_before_delivery',
      'supabase_unavailable',
      'firestore_unavailable',
      'firestore_transaction_retry',
      'payload_malformed',
      'payload_hash_mismatch',
      'target_path_mismatch',
      'registry_mismatch',
      'projection_conflict',
      'revocation_conflict',
      'unauthorized_target',
      'lease_conflict',
      'unknown_retryable',
      'unknown_terminal',
      'maximum_attempts_exhausted'
    )
  ),
  add constraint formula_projection_outbox_error_code_bounded check (
    last_error_code is null
    or last_error_code in (
      'supabase_unavailable',
      'firestore_unavailable',
      'firestore_transaction_retry',
      'payload_malformed',
      'payload_hash_mismatch',
      'target_path_mismatch',
      'registry_mismatch',
      'projection_conflict',
      'revocation_conflict',
      'unauthorized_target',
      'lease_conflict',
      'unknown_retryable',
      'unknown_terminal',
      'maximum_attempts_exhausted'
    )
  );

create index formula_projection_outbox_due_idx
  on formula_private.projection_outbox (
    state,
    next_attempt_at,
    revocation_version desc,
    projection_version desc
  )
  where state in ('pending', 'failed', 'processing');

create or replace function public.formula_claim_projection_outbox_batch(
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
declare
  candidate record;
  claimed record;
  v_now timestamptz := clock_timestamp();
  v_lease_token uuid;
  v_max_attempts constant integer := 8;
begin
  if p_worker_id is null
     or p_worker_id <> btrim(p_worker_id)
     or char_length(p_worker_id) not between 1 and 128
     or p_worker_id !~ '^[A-Za-z0-9._:-]+$' then
    raise exception using errcode = 'P0001', message = 'formula_outbox_worker_id_invalid';
  end if;

  if p_batch_size is null or p_batch_size not between 1 and 50 then
    raise exception using errcode = 'P0001', message = 'formula_outbox_batch_size_invalid';
  end if;

  if p_lease_seconds is null or p_lease_seconds not between 30 and 600 then
    raise exception using errcode = 'P0001', message = 'formula_outbox_lease_seconds_invalid';
  end if;

  -- Once a newer non-dead-letter projection exists, an unlocked lower row must
  -- never be delivered. A valid in-flight lease is never altered here.
  update formula_private.projection_outbox lower_row
     set state = 'processed',
         processed_at = v_now,
         result_code = 'superseded_before_delivery',
         last_error_code = null,
         lease_token = null,
         leased_by = null,
         lease_expires_at = null,
         updated_at = v_now
   where lower_row.state in ('pending', 'failed', 'processing')
     and (
       lower_row.state <> 'processing'
       or lower_row.lease_expires_at <= v_now
     )
     and exists (
       select 1
         from formula_private.projection_outbox newer
        where newer.event_registration_id = lower_row.event_registration_id
          and newer.projection_version > lower_row.projection_version
          and newer.state <> 'dead_letter'
     );

  -- A crashed worker may consume the final allowed attempt. Expired exhausted
  -- work is terminal rather than entering an infinite lease loop.
  update formula_private.projection_outbox exhausted
     set state = 'dead_letter',
         processed_at = null,
         result_code = 'maximum_attempts_exhausted',
         last_error_code = 'maximum_attempts_exhausted',
         lease_token = null,
         leased_by = null,
         lease_expires_at = null,
         updated_at = v_now
   where exhausted.attempt_count >= v_max_attempts
     and (
       (exhausted.state in ('pending', 'failed') and exhausted.next_attempt_at <= v_now)
       or (exhausted.state = 'processing' and exhausted.lease_expires_at <= v_now)
     );

  for candidate in
    select o.id
      from formula_private.projection_outbox o
     where o.attempt_count < v_max_attempts
       and (
         (o.state in ('pending', 'failed') and o.next_attempt_at <= v_now)
         or (o.state = 'processing' and o.lease_expires_at <= v_now)
       )
       and not exists (
         select 1
           from formula_private.projection_outbox newer
          where newer.event_registration_id = o.event_registration_id
            and newer.projection_version > o.projection_version
            and newer.state <> 'dead_letter'
       )
     order by
       ((o.payload ->> 'accessState') = 'revoked') desc,
       o.revocation_version desc,
       o.projection_version desc,
       o.created_at,
       o.id
     limit p_batch_size
     for update of o skip locked
  loop
    v_lease_token := gen_random_uuid();

    update formula_private.projection_outbox o
       set state = 'processing',
           lease_token = v_lease_token,
           leased_by = p_worker_id,
           lease_expires_at = v_now + make_interval(secs => p_lease_seconds),
           last_attempt_at = v_now,
           attempt_count = o.attempt_count + 1,
           processed_at = null,
           last_error_code = null,
           result_code = null,
           updated_at = v_now
     where o.id = candidate.id
     returning
       o.id as outbox_id,
       o.event_registration_id as event_registration_id,
       o.projection_version as projection_version,
       o.revocation_version as revocation_version,
       o.target_path as target_path,
       o.payload::text as payload_text,
       o.payload_sha256 as payload_sha256,
       o.lease_token as lease_token,
       o.attempt_count as attempt_count,
       o.lease_expires_at as lease_expires_at
      into claimed;

    outbox_id := claimed.outbox_id;
    event_registration_id := claimed.event_registration_id;
    projection_version := claimed.projection_version;
    revocation_version := claimed.revocation_version;
    target_path := claimed.target_path;
    payload_text := claimed.payload_text;
    payload_sha256 := claimed.payload_sha256;
    lease_token := claimed.lease_token;
    attempt_count := claimed.attempt_count;
    lease_expires_at := claimed.lease_expires_at;
    return next;
  end loop;
end;
$function$;

create or replace function public.formula_complete_projection_outbox(
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
declare
  current_row formula_private.projection_outbox%rowtype;
  v_now timestamptz := clock_timestamp();
begin
  if p_outbox_id is null or p_lease_token is null then
    raise exception using errcode = 'P0001', message = 'formula_outbox_lease_conflict';
  end if;

  if p_result_code is null or p_result_code not in ('applied', 'idempotent', 'superseded') then
    raise exception using errcode = 'P0001', message = 'formula_outbox_result_code_invalid';
  end if;

  if p_payload_sha256 is null or p_payload_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = 'P0001', message = 'formula_outbox_payload_hash_mismatch';
  end if;

  select o.*
    into current_row
    from formula_private.projection_outbox o
   where o.id = p_outbox_id
   for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'formula_outbox_not_found';
  end if;

  if current_row.payload_sha256 <> p_payload_sha256 then
    raise exception using errcode = 'P0001', message = 'formula_outbox_payload_hash_mismatch';
  end if;

  -- A response lost after commit may retry the exact acknowledgement. Payload
  -- immutability plus the bounded stored result makes that replay harmless.
  if current_row.state = 'processed' then
    if current_row.result_code = p_result_code then
      return p_result_code;
    end if;
    raise exception using errcode = 'P0001', message = 'formula_outbox_completion_conflict';
  end if;

  if current_row.state <> 'processing'
     or current_row.lease_token <> p_lease_token
     or current_row.lease_expires_at <= v_now then
    raise exception using errcode = 'P0001', message = 'formula_outbox_lease_conflict';
  end if;

  update formula_private.projection_outbox o
     set state = 'processed',
         processed_at = v_now,
         result_code = p_result_code,
         last_error_code = null,
         lease_token = null,
         leased_by = null,
         lease_expires_at = null,
         updated_at = v_now
   where o.id = p_outbox_id;

  return p_result_code;
end;
$function$;

create or replace function public.formula_fail_projection_outbox(
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
declare
  current_row formula_private.projection_outbox%rowtype;
  v_now timestamptz := clock_timestamp();
  v_next_state text;
  v_result_code text;
  v_max_attempts constant integer := 8;
begin
  if p_outbox_id is null or p_lease_token is null then
    raise exception using errcode = 'P0001', message = 'formula_outbox_lease_conflict';
  end if;

  if p_payload_sha256 is null or p_payload_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = 'P0001', message = 'formula_outbox_payload_hash_mismatch';
  end if;

  if p_retryable is null or p_error_code is null or p_error_code not in (
    'supabase_unavailable',
    'firestore_unavailable',
    'firestore_transaction_retry',
    'payload_malformed',
    'payload_hash_mismatch',
    'target_path_mismatch',
    'registry_mismatch',
    'projection_conflict',
    'revocation_conflict',
    'unauthorized_target',
    'lease_conflict',
    'unknown_retryable',
    'unknown_terminal'
  ) then
    raise exception using errcode = 'P0001', message = 'formula_outbox_error_code_invalid';
  end if;

  if p_retryable and p_error_code not in (
    'supabase_unavailable',
    'firestore_unavailable',
    'firestore_transaction_retry',
    'lease_conflict',
    'unknown_retryable'
  ) then
    raise exception using errcode = 'P0001', message = 'formula_outbox_error_class_invalid';
  end if;

  if not p_retryable and p_error_code not in (
    'payload_malformed',
    'payload_hash_mismatch',
    'target_path_mismatch',
    'registry_mismatch',
    'projection_conflict',
    'revocation_conflict',
    'unauthorized_target',
    'unknown_terminal'
  ) then
    raise exception using errcode = 'P0001', message = 'formula_outbox_error_class_invalid';
  end if;

  if (p_retryable and (p_retry_after_seconds is null or p_retry_after_seconds not between 5 and 3600))
     or (not p_retryable and coalesce(p_retry_after_seconds, -1) <> 0) then
    raise exception using errcode = 'P0001', message = 'formula_outbox_retry_delay_invalid';
  end if;

  select o.*
    into current_row
    from formula_private.projection_outbox o
   where o.id = p_outbox_id
   for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'formula_outbox_not_found';
  end if;

  if current_row.payload_sha256 <> p_payload_sha256 then
    raise exception using errcode = 'P0001', message = 'formula_outbox_payload_hash_mismatch';
  end if;

  if current_row.state = 'processed' then
    raise exception using errcode = 'P0001', message = 'formula_outbox_already_processed';
  end if;

  if current_row.state <> 'processing'
     or current_row.lease_token <> p_lease_token
     or current_row.lease_expires_at <= v_now then
    raise exception using errcode = 'P0001', message = 'formula_outbox_lease_conflict';
  end if;

  if p_retryable and current_row.attempt_count < v_max_attempts then
    v_next_state := 'failed';
    v_result_code := p_error_code;
  else
    v_next_state := 'dead_letter';
    v_result_code := case
      when p_retryable then 'maximum_attempts_exhausted'
      else p_error_code
    end;
  end if;

  update formula_private.projection_outbox o
     set state = v_next_state,
         next_attempt_at = case
           when v_next_state = 'failed'
             then v_now + make_interval(secs => p_retry_after_seconds)
           else o.next_attempt_at
         end,
         processed_at = null,
         last_error_code = v_result_code,
         result_code = v_result_code,
         lease_token = null,
         leased_by = null,
         lease_expires_at = null,
         updated_at = v_now
   where o.id = p_outbox_id;

  return v_next_state;
end;
$function$;

revoke execute on function public.formula_claim_projection_outbox_batch(text, integer, integer)
  from public, anon, authenticated;
revoke execute on function public.formula_complete_projection_outbox(uuid, uuid, text, text)
  from public, anon, authenticated;
revoke execute on function public.formula_fail_projection_outbox(uuid, uuid, text, text, boolean, integer)
  from public, anon, authenticated;

grant execute on function public.formula_claim_projection_outbox_batch(text, integer, integer)
  to service_role;
grant execute on function public.formula_complete_projection_outbox(uuid, uuid, text, text)
  to service_role;
grant execute on function public.formula_fail_projection_outbox(uuid, uuid, text, text, boolean, integer)
  to service_role;