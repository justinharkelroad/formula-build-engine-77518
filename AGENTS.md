# Formula Build Repository Instructions

These instructions apply to all work in this repository.

## Package manager and dependencies

- npm is the authoritative local package manager. Repository evidence includes the npm commands in `README.md`, the tracked `package-lock.json`, and the installed `node_modules/.package-lock.json` marker.
- Use npm commands and treat `package-lock.json` as the local dependency lockfile.
- `bun.lock` and `bun.lockb` are tracked legacy artifacts. Do not use, delete, edit, or regenerate them unless Justin or Mary separately authorizes dependency work.
- Do not run an install command when the approved scope excludes dependency changes. Never change `.env` files, dependencies, `package.json`, or a lockfile as a side effect of unrelated work.

## Working copy and preservation rules

- Formula implementation work in Buzz belongs in `WRITABLE_REPOS/formula-build-engine-77518/`. Use `REPOS/formula-build-engine-77518/` only for read-only comparison.
- Create and check out a named branch before the first scoped edit. Never create a work commit from detached HEAD.
- Preserve unrelated work. Never edit, restore, stash, stage, or commit `supabase/.temp/cli-latest`. It is a tracked file that Supabase CLI commands rewrite, so a working copy may carry an unrelated local version bump in it. Do not run Supabase CLI commands under a scope that does not call for them.
- Stage explicit approved paths only, for example `git add AGENTS.md`. Do not use `git add .`, `git add -A`, or `git commit -a`.

## Verification

- The baseline at commit `a923a0ed992cb92698ebc36eee541b670bdc4ea5` is 33 lint errors and 18 warnings. `npm run lint` exits nonzero at that baseline, so repository-wide green lint is not the current gate. Re-measure and record a new baseline whenever the base commit changes, and never compare a lint delta against a baseline recorded at a different commit.
- Run `npm run lint` and report the exact totals. A scoped change must introduce no new lint findings relative to the recorded baseline.
- For every changed JavaScript or TypeScript path, also run the local ESLint binary against the explicit paths and report the changed-file lint delta. New errors or warnings in changed files are not acceptable.
- This repository has no automated test runner or test script. Do not claim that tests passed. If a future scope adds a test runner, update this instruction and run the new full suite.
- A production build with `npm run build` is required before handoff. Report its exit status and warnings accurately.
- Attribute every verification result to the exact `git rev-parse HEAD` and worktree state that produced it.

## Git and human gates

- In the Buzz Builder clone, `remote.origin.pushurl` is intentionally set to the literal value `BLOCKED-ask-justin-or-mary`. This is a clone-local guardrail in `.git/config`, not a guarantee carried by this tracked file or by other clones. Do not repair or bypass it.
- Before any separately authorized future push, run `git fetch origin`, verify the branch is based on the current remote head, and obtain Justin or Mary's explicit approval to replace the blocked push URL for that action.
- Implementation permission does not grant commit permission. Commit, push, pull request, merge, deployment, production-data change, production migration, and public action are separate gates. Each requires its own explicit authorization from Justin or Mary.
- Pricing and business policy are not agent-controlled. Client communication is human-only unless a separate explicit rule states otherwise.

## Lovable boundary

- Only Justin may click or invoke Lovable Publish, Update, or Republish. Agents must never publish through Lovable, call a Lovable deployment API, automate publishing, or delegate it.
- After authorized repository work is merged and read-only evidence shows Lovable History ingested the exact commit, stop with: `Ready for Justin to publish in Lovable.`
