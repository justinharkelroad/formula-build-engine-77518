-- The earlier 20250823190525 migration owns app_role and user_roles.
-- This migration validates that baseline before evolving its authorization API.
do $migration$
declare
  existing_enum_labels text[];
begin
  if pg_catalog.to_regtype('public.app_role') is null then
    raise exception using
      errcode = 'P0001',
      message = 'migration_baseline_missing_public_app_role';
  end if;

  select pg_catalog.array_agg(e.enumlabel order by e.enumsortorder)
    into existing_enum_labels
    from pg_catalog.pg_enum e
    join pg_catalog.pg_type t on t.oid = e.enumtypid
    join pg_catalog.pg_namespace n on n.oid = t.typnamespace
   where n.nspname = 'public'
     and t.typname = 'app_role';

  if existing_enum_labels is distinct from array['admin', 'user']::text[] then
    raise exception using
      errcode = 'P0001',
      message = 'migration_baseline_incompatible_public_app_role';
  end if;

  if pg_catalog.to_regclass('public.user_roles') is null then
    raise exception using
      errcode = 'P0001',
      message = 'migration_baseline_missing_public_user_roles';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'user_roles'
       and c.relkind in ('r', 'p')
       and c.relrowsecurity
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'migration_baseline_incompatible_public_user_roles_rls';
  end if;

  if exists (
    select 1
      from (
        values
          ('id', 'uuid'::pg_catalog.regtype, true),
          ('user_id', 'uuid'::pg_catalog.regtype, true),
          ('role', 'public.app_role'::pg_catalog.regtype, true),
          ('created_at', 'timestamp with time zone'::pg_catalog.regtype, true)
      ) as expected(column_name, type_oid, required_not_null)
      left join pg_catalog.pg_attribute a
        on a.attrelid = 'public.user_roles'::pg_catalog.regclass
       and a.attname = expected.column_name
       and a.attnum > 0
       and not a.attisdropped
     where a.attnum is null
        or a.atttypid <> expected.type_oid
        or (expected.required_not_null and not a.attnotnull)
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'migration_baseline_incompatible_public_user_roles_columns';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_constraint con
     where con.conrelid = 'public.user_roles'::pg_catalog.regclass
       and con.contype = 'p'
       and con.conkey = array[
         (
           select a.attnum
             from pg_catalog.pg_attribute a
            where a.attrelid = 'public.user_roles'::pg_catalog.regclass
              and a.attname = 'id'
         )
       ]::smallint[]
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'migration_baseline_incompatible_public_user_roles_primary_key';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_constraint con
     where con.conrelid = 'public.user_roles'::pg_catalog.regclass
       and con.contype = 'u'
       and con.conkey = array[
         (
           select a.attnum
             from pg_catalog.pg_attribute a
            where a.attrelid = 'public.user_roles'::pg_catalog.regclass
              and a.attname = 'user_id'
         ),
         (
           select a.attnum
             from pg_catalog.pg_attribute a
            where a.attrelid = 'public.user_roles'::pg_catalog.regclass
              and a.attname = 'role'
         )
       ]::smallint[]
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'migration_baseline_incompatible_public_user_roles_unique_key';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_constraint con
     where con.conrelid = 'public.user_roles'::pg_catalog.regclass
       and con.contype = 'f'
       and con.confrelid = 'auth.users'::pg_catalog.regclass
       and con.confdeltype = 'c'
       and con.conkey = array[
         (
           select a.attnum
             from pg_catalog.pg_attribute a
            where a.attrelid = 'public.user_roles'::pg_catalog.regclass
              and a.attname = 'user_id'
         )
       ]::smallint[]
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'migration_baseline_incompatible_public_user_roles_user_fk';
  end if;

  if not exists (
    select 1
      from pg_catalog.pg_policies p
     where p.schemaname = 'public'
       and p.tablename = 'user_roles'
       and p.policyname = 'Users can view their own roles'
       and p.cmd = 'SELECT'
       and 'authenticated' = any (p.roles)
       and not ('anon' = any (p.roles))
       and not ('public' = any (p.roles))
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'migration_baseline_incompatible_public_user_roles_select_policy';
  end if;
end
$migration$;

-- Create the role-check helper without recreating or mutating role storage.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
      from public.user_roles
     where public.user_roles.user_id = _user_id
       and public.user_roles.role = _role
  )
$function$;

-- Replace the broad waitlist read policy with the intended admin-only policy.
drop policy if exists "Authenticated users can view waitlist" on public.waitlist;
drop policy if exists "Only admins can view waitlist" on public.waitlist;

create policy "Only admins can view waitlist"
on public.waitlist
for select
to authenticated
using (public.has_role((select auth.uid()), 'admin'::public.app_role));

-- The existing public waitlist INSERT policy remains unchanged.
