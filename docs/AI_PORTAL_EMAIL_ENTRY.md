# AI toolkit: email-only entry

Entering an eligible Formula email opens `/ai-portal`. There is no email delivery,
one-time code, resend countdown, or mobile-app account requirement.

Justin explicitly requested email matching without mailbox verification on
2026-11-02. Knowing an eligible address is sufficient to use the toolkit. The
existing roster, purchaser, partner, verified alternate-email, manual-approval,
suspension and revocation rules remain the source of eligibility.

Entry issues a random 256-bit token for this toolkit only. The database stores
its SHA-256 hash. The browser remembers the token locally; each protected action
rechecks the access end date and current eligibility. Entry never creates an
`auth.users` account or a Supabase Auth session, and does not log the browser into
website admin. Signing out clears only toolkit access in this browser. Existing
website-auth clients remain compatible while the new frontend rolls out.

## Validation

- `npm run typecheck`
- `npm run test:ai-portal`
- `npm run test:ai-portal-admin`
- `npm run test:ai-portal-email` (requires PostgreSQL `initdb`, `pg_ctl`, `psql`)
- `deno check --no-lock supabase/functions/formula-ai-portal/index.ts supabase/functions/formula-ai-portal-signin/index.ts`
- `npx eslint src/pages/AIPortal.tsx src/pages/AdminAIPortal.tsx src/lib/aiPortal.ts`
- `npm run build`

The email-entry test starts a disposable PostgreSQL cluster with the actual
original eligibility function and new migration. It checks eligible and denied
emails, no Auth-account creation, isolated sessions, revoked/forged sessions,
access dates, closed entry, monotonic progress, downloads, rate limits and RPC
permissions. Browser QA used fictional addresses and a local fixture API; no
production migration, function deployment or publishing was performed.

## Release order — human action required

1. Review and apply migration `20261102134823_formula_ai_portal_email_entry.sql`
   to Formula's actual Lovable Cloud database (`koubtooblwjcwubcuhml`). This is
   not the separate F3formula Supabase project.
2. Release `formula-ai-portal-signin` and `formula-ai-portal`, retaining their
   existing `verify_jwt = false` configuration and bundled shared files.
3. Merge the reviewed frontend, confirm Lovable History has the exact commit,
   and have Justin publish in Lovable.
4. Check a registered email and an unmatched email on the released portal,
   then verify a guide download and saved video progress.

Existing sessions keep working while the entry switch is closed; new entry is
blocked. The default overall access end remains April 1, 2027, Eastern.

The human-only Lovable rule and its narrow backend exception do not authorize
Codex to apply this new migration or deploy these two functions. Those production
steps remain pending; this document is not deployment authorization.
