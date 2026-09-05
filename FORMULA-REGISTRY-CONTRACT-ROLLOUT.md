# Formula 2026 registry contract rollout

This runbook coordinates the workbook registry contract across Firebase backend, bundled Formula Flow, Supabase, and projected attendee/partner access records.

- Known predecessor hashes:
  - `e848e7a952badb1e1c072fc81050cafafca597ea45189f91cf30645fcfc5e404`
  - `e6d64ba4b9b13f1d577d7ace6a8e406e67cdccc6cf03af8290caee21c1b49faa`
- Current hash: `bcbb5db2c7e4234400cfeb63aa3ea2043e4bc7985d028b109b968226b946f9b1`
- Registry version: `1`

Do not run the transition while an old Flow client is open to ordinary attendees. Every one-sided rollout order creates a temporary mismatch. Keep the event in `pre_event` or `paused` for the coordinated change.

## Controlled sequence

1. Record the exact Firebase backend, bundled Formula Flow, and website commit SHAs in the release evidence. Confirm both backend and Flow target the current hash above.
2. Deploy the backend and bundled Flow contract while attendee access remains closed. Justin alone publishes or updates the Lovable website.
3. Apply `20260905171632_transition_formula_2026_registry_contract.sql` to the correct Supabase project. Its owner-only transition accepts only either known predecessor hash at registry version 1, returns without writes if already current, and fails closed for any other state.
4. Drain the projection outbox. The transition increments each linked entitlement's projection version and enqueues a new payload; existing drainer rules supersede lower queued versions.
5. Verify the event row is current and the projection backlog is zero. Check ordinary owner, team member, approved partner owner, and approved partner staff access documents all carry the current hash.
6. Run an ordinary-account browser/mobile smoke through Account, library, and one representative capture state. Reopen attendee access only after all checks pass.

## Read-only verification queries

```sql
select id, registry_version, registry_hash, updated_at
from public.formula_events
where id = 'formula-2026';

select state, count(*)
from formula_private.projection_outbox
group by state
order by state;

select
  count(*) filter (where payload ->> 'registryHash' = 'bcbb5db2c7e4234400cfeb63aa3ea2043e4bc7985d028b109b968226b946f9b1') as current_hash_rows,
  count(*) filter (where payload ->> 'registryHash' <> 'bcbb5db2c7e4234400cfeb63aa3ea2043e4bc7985d028b109b968226b946f9b1') as other_hash_rows
from formula_private.projection_outbox
where state in ('pending', 'failed', 'processing');
```

Do not treat source files or a successful migration as proof that production clients and access documents are aligned. Preserve the query results and ordinary-account smoke evidence with the recorded release SHAs.
