# Formula 2026 post-event access rollout

## Contract

Both attendee capture and dashboard access remain available through the end of April 1, 2027 in `America/New_York`.

- Inclusive UTC cutoff: `2027-04-02T03:59:59.999Z`
- Database fields: `capture_write_until` and `dashboard_read_until`
- Scope: event `formula-2026` and its `pending` or `active` entitlements
- Exclusions: suspended and revoked entitlements, and every unrelated event

Migration `20260905213230_extend_formula_2026_post_event_access.sql` updates the Formula event defaults, refreshes stale eligible entitlements, increments their projection versions, and queues a projection only when the registration already has an active Firebase identity. A narrow insert trigger makes later Formula 2026 purchase/admin entitlements inherit the event defaults despite the older literals preserved in applied migrations.

The SQL refresh owns entitlement version increments and outbox creation. Backend convergence must use the same instant and must not separately mutate or enqueue those SQL-owned entitlement rows. Unlinked eligible records receive the new database window and projection version; their first successful identity link will enqueue the current projection through the existing claim path.

## Controlled rollout

No production migration was run while preparing this change.

1. Keep the event/projector rollout in its controlled maintenance state. Record the current Formula event row, eligible entitlement counts by access state, linked stale-window count, and projection backlog.
2. Deploy backend, Flow, and native artifacts that use the exact UTC cutoff above. Confirm the deployed backend does not perform a second entitlement-version refresh for rows owned by this migration.
3. Apply the additive Supabase migration once. It invokes the owner-only idempotent refresh in the migration transaction.
4. Drain the projection outbox. Confirm there are no failed or dead-letter rows for the refreshed registrations.
5. Verify the event row, ordinary owner/team entitlements, and approved partner entitlements all carry both exact cutoffs. Confirm suspended/revoked states and unrelated-event windows are unchanged.
6. Verify a sample of linked Firebase projections has matching `captureWriteUntil` and `dashboardReadUntil`, then perform the authorized role-specific smoke checks before reopening normal processing.

## Read-only verification queries

```sql
select id, capture_write_until, dashboard_read_until
from public.formula_events
where id = 'formula-2026';

select entitlement.access_state,
       registration.event_role,
       count(*) as entitlement_count,
       count(*) filter (
         where entitlement.capture_write_until = '2027-04-02T03:59:59.999Z'::timestamptz
           and entitlement.dashboard_read_until = '2027-04-02T03:59:59.999Z'::timestamptz
       ) as exact_window_count
from public.formula_entitlements entitlement
join public.formula_event_registrations registration
  on registration.id = entitlement.event_registration_id
where registration.event_id = 'formula-2026'
group by entitlement.access_state, registration.event_role
order by entitlement.access_state, registration.event_role;

select state, count(*)
from formula_private.projection_outbox
where event_registration_id in (
  select registration.id
  from public.formula_event_registrations registration
  where registration.event_id = 'formula-2026'
)
group by state
order by state;
```

## Recovery

The migration and its refresh function are idempotent. Rerunning the refresh after the event and eligible entitlements have the exact cutoff returns zero and creates no outbox rows. If rollout stops after the database migration, leave processing controlled, repair the backend/projector issue, rerun the owner-only refresh only if records became stale, and drain the existing outbox.

Do not shorten an already-open access window as an ad hoc rollback. Any business-approved cutoff reversal requires a separate reviewed migration that preserves suspension/revocation state and emits monotonic projections.
