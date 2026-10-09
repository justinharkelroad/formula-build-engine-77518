# Formula AI portal release

Status: code ready for review. Nothing here has been applied to production or published.

## What it is

`theformulaforum.com/ai-portal` is the private Formula 2026 AI toolkit: the two Agency AI Install replays, the build guides, Claude and Codex starter packs, and the ten agency skills. `/admin/ai-portal` is where Justin and Mary manage it.

- **Who gets in:** anyone with an active Formula 2026 roster seat, a ticket purchaser, a partner contact on a partner profile or partner purchase, or someone an admin approves by hand. Suspended or revoked roster seats stay out.
- **How they get in:** they open the page, enter their email, and receive a 6-digit code from `tickets@theformulaforum.com`. No password is created or changed. Website admin accounts cannot use codes.
- **When:** sign-in stays closed until an admin opens it. Open it on the closing Zoom call. Closing it later stops new sign-ins but does not log out people already signed in.
- **How long:** access ends April 1, 2027 at midnight Eastern, the same end date as the app.
- **Not on the list?** The page offers "Request access". Requests land in Mary's queue on the admin page.

Nobody is emailed or activated automatically. Every replay, download and progress write is re-checked on the server. Files live in a private bucket and are handed out as 5-minute links.

## Release order (Justin)

1. **Merge the PR.** Lovable syncs the branch, including migration `20261009200000_formula_ai_portal.sql` and three functions: `formula-ai-portal-signin`, `formula-ai-portal`, `formula-ai-portal-admin`.
2. **Secrets in Lovable Cloud.** `RESEND_API_KEY`, `FORMULA_EMAIL_FROM` and `FORMULA_EMAIL_REPLY_TO` already exist for ticket emails, and the portal reuses them. Add one new secret: `AI_PORTAL_CLIENT_SALT`, set to any long random value. It keeps the rate-limit records from storing raw IP addresses. If Test and Live environments are separate, add it to both.
3. **Upload the files.** Open `/admin/ai-portal` → Files → Upload files, then select all nine files in `~/formula-ai-portal-content/dist/private` (folders `claude`, `codex` and `common`). Each file is matched by its exact contents and stored in the right place. All nine must show **Ready**.
4. **Test with your own email.**
   1. Add a manual approval for a personal address.
   2. Open sign-in and visit `/ai-portal`.
   3. Request a code, enter it, and download one file. Play a replay for a minute.
   4. Confirm the admin page shows the visit, the requested file and the progress.
   5. Close sign-in again.
5. **Vimeo (recommended).** In both replays' privacy settings, change "Embeddable anywhere" to specific domains: `theformulaforum.com`, `standardplaybook.com`, and the Lovable preview domain. The video IDs already appear in the public Standard repository, so this setting is what actually limits where the replays play.
6. **Publish in Lovable.** This step is Justin's only.
7. **On the Zoom call.** Open sign-in on `/admin/ai-portal` and share `theformulaforum.com/ai-portal`.

## Copy elsewhere on the site that disagrees with this

The homepage gift section, pricing, FAQ and structured data still say "five skills" and "when final-day attendance is confirmed". The toolkit ships ten skills, and access is granted by registration. Decide whether to update that copy before publishing.

## Rollback

- Turn sign-in off on `/admin/ai-portal`. This takes effect immediately for new sign-ins.
- Revoke a person on the admin page. They lose access on their next click.
- Do not drop the portal tables. They are the audit record.

## Known limits

- A 6-digit code can be guessed only within the auth service's own verification rate limits. Codes are single-use, and requesting a new code cancels the previous one.
- A signed download link already handed out keeps working for up to 5 minutes after a revocation.
- "Files requested" counts download links issued, not completed downloads. "Furthest reached" is the furthest point played, not watch time.

## Verification done before review

All of this ran on an isolated local copy of the full stack, with the real migrations, auth service, storage and edge functions. Email went to a local capture server instead of Resend.

- **Migration:** applies on top of every existing migration. One September Lovable migration duplicates an earlier one; it was skipped locally only, and the repository is unchanged.
- **Backend:** an end-to-end run passed 52/52. It covers:
  - closed by default, and only admins can open sign-in
  - roster, purchaser, partner and manual sign-ins
  - wrong, reused and old codes are rejected
  - identical replies and timing for unknown emails
  - no codes for admin accounts
  - suspended seats are blocked
  - exact-byte uploads only, private bucket, exact file delivered
  - progress only goes up
  - revoke and restore, request-then-approve, rate limits
  - existing passwords keep working
  - audit rows are written
- **Website build:** passes. `/ai-portal` is prerendered with `noindex, nofollow`, and no file names, checksums or video IDs appear in the public bundle.
- **Code checks:** the typecheck (`tsc -b`), lint on the new files, and `npm run test:ai-portal` all pass.
