-- Lovable Cloud enforces safe updates for PostgREST RPCs.
-- Every catalog ID is non-null; retain the complete-snapshot refresh while
-- making its update predicate explicit. Existing function grants are preserved.
create or replace function public.formula_bridge_sync_partner_catalog(p_integration_secret text, p_companies jsonb)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  if jsonb_typeof(p_companies) is distinct from 'array' or jsonb_array_length(p_companies) > 1000 then
    raise exception 'formula_partner_catalog_invalid';
  end if;
  if exists (select 1 from jsonb_array_elements(p_companies) c where
      coalesce(c->>'id','') !~ '^[A-Za-z0-9_-]{1,128}$'
      or char_length(coalesce(c->>'businessName','')) not between 1 and 200
      or jsonb_typeof(c->'active') is distinct from 'boolean'
      or jsonb_typeof(coalesce(c->'memberEmails','[]'::jsonb)) is distinct from 'array') then
    raise exception 'formula_partner_catalog_invalid';
  end if;
  -- A complete snapshot disables removed companies, including blocked vendors.
  update formula_private.partner_company_catalog set active = false, synced_at = now()
    where id is not null;
  insert into formula_private.partner_company_catalog(id, business_name, active, member_emails, synced_at)
    select c->>'id', c->>'businessName', (c->>'active')::boolean,
      array(select lower(btrim(email)) from jsonb_array_elements_text(coalesce(c->'memberEmails','[]'::jsonb)) emails(email)), now()
    from jsonb_array_elements(p_companies) c
  on conflict(id) do update set business_name = excluded.business_name,
    active = excluded.active, member_emails = excluded.member_emails, synced_at = excluded.synced_at;
end $$;
