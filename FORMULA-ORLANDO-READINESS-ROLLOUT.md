# Ready for Orlando — registration bridge rollout

The additive migration `supabase/migrations/20260923010000_formula_orlando_readiness_bridge.sql` exposes two read-only RPCs behind the existing Firebase projection bridge secret. It does not assign seats, claim identities, alter purchases, or change entitlements. The Firebase staff callable must verify an existing event admin before invoking the roster RPC.

## Correct production target

The production Firebase `FORMULA_SUPABASE_URL` hostname and website configuration both identify **koubtooblwjcwubcuhml.supabase.co**. The saved Supabase CLI link in this checkout points to the older **byoxxlouggcvbdizhgdp** project. Do not run `supabase db push --linked` from this checkout. The current CLI account cannot access the production Cloud project.

Justin must apply the reviewed migration to the production Cloud database using the authorized project workflow. Codex must not publish, update, republish, or deploy through Lovable. Only Justin publishes the website in Lovable after the supporting services are ready.

## Release order

1. Merge the reviewed website SQL and link changes, plus the matching app/backend and Flow changes.
2. Apply the single readiness migration to the correct Cloud database. Do not replay unrelated migrations or change the integration secret.
3. Verify both RPC signatures exist, and confirm an incorrect integration secret is rejected. Do not paste the real secret into logs or screenshots.
4. Deploy only the three new Firebase callables: `getOrlandoReadiness`, `completeOrlandoPractice`, and `listOrlandoReadinessExceptions` from the reviewed app commit.
5. Build Flow and Partner Hub together with the app repository's `scripts/build-flow-web.sh` and deploy the combined Firebase Hosting bundle. Deploying Flow alone erases Partner Hub and is prohibited by its predeploy guard.
6. Verify a real owner, team member, partner and admin checklist using consented test accounts. Verify that an ordinary attendee cannot load the staff list, and that photo practice never uploads the photo or invokes AI.
7. Distribute the new iOS and Android builds through the existing store workflow. Justin publishes the website entry links in Lovable.

Readiness remains available before the live-event gate opens. Existing event/workbook gates remain unchanged. The practice URL is `https://flow.theformulaforum.com/ready/practice?code=ORLANDO-READY-2026`.

## Verification

The new migration and 30 pgTAP assertions passed in an isolated local PostgreSQL database using the real registration migrations, pgTAP, and Vault extension. Coverage includes wrong-secret rejection, UID/email validation, verified-payer scoping, named and unnamed purchase ordinals, suspended seats, real versus solo agency connections, never-signed-in registrations, pagination and private-helper privileges.

The website typecheck, changed-file ESLint and production build passed. Repository-wide lint has pre-existing errors outside these changes. No production migration or Lovable publish was performed during preparation.

## Operational limits

Purchase summaries match the independently verified sign-in email to the checkout payer email. A different billing email needs staff help; the UI does not invent a zero-seat result. Suspended/revoked named ordinals remain assigned and separately need review. Staff pagination can have an empty page with a continuation token; continue through all pages for the complete exception list.
