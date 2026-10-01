# Attendee partner-company connection — 2026-10-01

## Result and admin workflow

In the attendee access portal, add/edit a person or assign a purchased seat, choose **Partner company for AI breakdowns**, and save. Their ticket role and agency workspace stay separate from their explicit partner company. Existing accounts connect through the scheduled bridge; an assignment for someone without an app account persists until their matching account signs in and completes the existing identity-verification requirements.

The roster displays the selected company and its connection state. Already-connected Partner Hub accounts are displayed using verified membership plus canonical Firebase Auth email. No email-domain or agency-name guessing is used. No real attendee company assignments were made during implementation.

The backend writes the protected Firebase company link and membership used by the existing partner AI context resolver. It does not generate a new workbook breakdown by itself or change session applicability. Admin roles and primary contacts are preserved. Roster-owned active ticket access must already be projected before membership is applied; this worker cannot issue or broaden a ticket. Disabled accounts, inactive companies, conflicting identities, and accounts linked to another company require attention. Same-version retries do not undo a removal in Partner Hub. Connected email changes and company moves are guarded; move/remove in Hub first, wait for the roster state to reflect removal, then save a new explicit assignment.

## Rollout order and publication boundary

1. Apply website migration `20261001135957_attendee_partner_company_assignment.sql` against the existing Formula production schema. It adds private tables and RPCs; it depends on the existing attendee and scoped identity/projection bridge functions. Use the authorized database deployment workflow. The Supabase connector denied production SQL access in this session; no production migration has been applied.
2. Deploy the website `formula-admin-attendees` Edge Function after the migration. Older open portal pages are compatible: requests without the new field preserve saved assignments.
3. With Justin's explicit Firebase deployment approval, deploy the AI functions `syncAttendeePartnerAssignments` and updated `onPartnerOrgMemberCreated` together. The trigger must recognize roster provenance before the worker runs. The worker uses the existing three projection secrets and projection drain gate; retain the established production gate settings and expected Supabase project ref. Never print secrets or grant a service-role credential to Flutter/the browser. Do not deploy unrelated hosting, rules, or functions for this change.
4. Verify that the approved company catalog is populated (the worker runs every minute), then Justin publishes the website in Lovable. Do not publish a UI that depends on missing backend RPCs. Only Justin may click Publish/Update/Republish or call Lovable deployment.
5. With an approved test attendee and company, verify save → identity/ticket projection → `Company account connected` → applicable workbook business-session scan/upload → company-context breakdown. Check both a pre-existing app account and a future-sign-in assignment. This production end-to-end verification remains pending rollout; local checks are not a claim that production is live.

The existing mobile releases under review are unchanged. The automatic company bridge works server-side with existing app clients. The small Flutter existing-company picker loading fix needs the next Flutter/web-portal build to appear; it does not require replacing the current store submissions to enable the server bridge.

## Validation

- AI production TypeScript build passed.
- Full AI unit suite: **1,524 passed, zero failures**, including the new bridge cases. Initial sandbox-only transport tests could not bind loopback; the permitted local-network rerun passed.
- Firestore emulator: **25 passed**, including 5 actual membership-transaction cases and 20 existing partner-event-access cases. Ticket preservation, inactive/mismatched identity, revocation, stale assignment, primary/admin preservation, and explicit Hub removal were exercised.
- Actual new SQL migration executed locally with PGlite 0.5.8: **34 acceptance assertions passed**. The old roster tables/RPCs are minimal fixture adapters; this is not full historical migration-chain or production-database verification.
- Website production build and focused attendee-page lint passed.
- Deno check of the changed attendee Edge Function passed.
- Flutter analysis of the changed admin screen passed.
- Broader AI `typecheck` still reports four pre-existing TS1378 top-level-await errors in unchanged `scripts/e2eSeedFocus.ts`; that file matches baseline 890a69c. Production build excludes this script and passes.
- `git diff --check` passed.

Codebase graph tools were unavailable in the active tool inventory. Exact source reads were used; no exhaustive graph/index-coverage claim is made.

## Reproduce the browser preview

The preview renders the actual `AdminFormulaAttendees` component with a local-only Supabase fixture. Example email addresses are used; no production auth, ticket, company, or account mutation occurs. Screenshots show the selected company and saved roster status.

```sh
npm ci
npx vite --config docs/reviews/attendee-partner-link-20261001/preview/vite.config.ts
```

Open `http://127.0.0.1:5187/`, choose Manage → Edit attendee, select a company, save, then reopen edit to verify persistence. The fixture illustrates the UI only; it is not an integration backend.

```sh
npm install --prefix /tmp/formula-partner-sql-test --no-save --package-lock=false @electric-sql/pglite@0.5.8
FORMULA_PGLITE_ROOT=/tmp/formula-partner-sql-test/node_modules/@electric-sql/pglite node scripts/testAttendeePartnerAssignment.mjs
```
