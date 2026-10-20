# Formula 2026 post-event surveys release

Status: code ready for review. Nothing here has been applied to production or published.

## What it is

- `theformulaforum.com/survey` replaces the 2025 Jotform page. It offers two choices.
- `/survey/attendee` is the attendee survey: ten questions in four steps, then a review screen.
  - Answers are anonymous by default.
  - Name and email are asked for only if the person chooses to include them.
- `/survey/partner` is the partner survey: one response per company, always with company, name and email.
- `/admin/survey-results` is the private results page. It has two CSV exports: a full file, and a shareable file with no names or emails.

Who can read results: Justin, Mary and Gregg only. Two checks apply, on the server and in the database:

- Their account must be a website admin.
- Their sign-in email must be on the survey reviewer list.

Being an admin is not enough on its own.

Session names come from the agenda: the eight working sessions plus Garrett J. White. The evening events are named as the agenda printed them: Poolside Cocktail Hour and Formula Thursday Night.

## Release order (Justin)

1. **Merge the PR.** Lovable syncs the branch, including:
   - the migration `20261020170000_formula_2026_post_event_surveys.sql`
   - two functions: `formula-survey-submit` and `formula-survey-results`
2. **Secret in Lovable Cloud.** Add `SURVEY_CLIENT_SALT`, set to any long random value.
   - If `AI_PORTAL_CLIENT_SALT` already exists, the survey uses it, and this step is optional.
   - If neither exists, every submission is refused. Nothing saves without a salt, by design.
   - If Test and Live environments are separate, add it to both.
3. **Add the three reviewers.** Run this in the Lovable Cloud SQL editor, using the email each person signs in to `/admin/auth` with:

   ```sql
   insert into formula_private.survey_reviewers (email) values
     (lower('JUSTIN_ADMIN_EMAIL')),
     (lower('MARY_ADMIN_EMAIL')),
     (lower('GREGG_ADMIN_EMAIL'))
   on conflict (email) do nothing;
   ```

   Each person also needs the website admin role they already use for the other admin pages.
4. **Test on the preview before sending.**
   1. Submit one anonymous attendee response with the word `RELEASETEST` in question 8.
   2. Submit one partner response using your own email.
   3. Open `/admin/survey-results` and confirm both show up.
   4. Delete the test rows:

   ```sql
   delete from formula_private.survey_responses
    where free_text_answers->>'a_q8_action' like '%RELEASETEST%'
       or id in (select response_id from formula_private.survey_contact_details where email = lower('YOUR_EMAIL'));
   ```
5. **Publish in Lovable.** This step is Justin's only.
6. **Thursday send.** Use these links:
   - attendees: `theformulaforum.com/survey/attendee`
   - partners: `theformulaforum.com/survey/partner`
   - both: `/survey`

## Privacy decisions built in

- **What an anonymous response stores:** a role (optional), the answers, and the hour it arrived.
  - No contact details, account, registration, email or IP.
  - If someone types their name and then switches back to anonymous, the page throws it away before sending.
- **Rate limiting:** a separate request, in its own database transaction. It stores only a counter per salted connection hash per 10-minute window, and deletes it after an hour. Nothing ties a connection to a response.
- **The limit:** 20 submissions per connection per 10 minutes, and 60 per hour.
- **No trackers on any survey page:**
  - the Meta Pixel does not load, including the no-JavaScript image
  - page views are not sent
  - Google Analytics is switched off
- **Log hygiene:** the functions never log answers, names or emails.
- **Retention:** responses are kept until an owner deletes them (Justin's decision). Nothing expires them.

## How the results page counts

- Every figure shows its count and its denominator.
- Some answers are counted and shown but never scored, and never part of a percentage: unanswered, Unable to assess, Did not attend, Not applicable, Too early, Not tracked, Unsure.
- Session usefulness uses only attendees who attended and rated that session.
- Attendance intent for 2027 is shown as a 0–10 distribution and a median. It is not an NPS.
- Partner next steps are counts, not sales.
- If a company submits more than once, the figures use its latest response, and a banner names the company. The CSV files keep every response.

## Not built (deliberately)

- **The optional date-preference and testimonial modules.** They are off in the brief until the 2027 dates are confirmed. The server rejects their fields.
- **Automatic theme coding of written answers.** The results page lists the written answers, showing the attendee's role or the partner's company.
- **Expected-time copy.** The brief says to add it only after real usability testing.

## Rollback

- Revert the PR. The old Jotform page returns with it.
- Do not drop the survey tables. They are the response record.

## Verification done before review

All of this ran on an isolated local copy of the full stack: the real migrations, auth, the edge functions and the built site.

**Migration**
- Applies on top of every existing migration.
- One September Lovable migration duplicates an earlier one. It was skipped locally only, the same as for the AI portal release. The repository is unchanged.

**Backend: end-to-end run passed 27/27.** It covers:
- anonymous saves carry no contact
- an anonymous payload that includes contact fields is refused
- identified attendees need a name and a valid email
- partners cannot be anonymous, including through a direct database call
- Q5 greater than Q4 is refused, while unknowns are accepted
- skipped answers stay absent, and 0 stays distinct
- unknown options, disabled-module fields and over-length text are refused
- retries never create a second row
- a broken save returns an error, never success
- the rate limit applies
- a response and its rate-limit entry are written in separate transactions
- the anon and authenticated roles cannot read the tables or call the functions
- results return 401 with no token, 403 for an admin not on the list, 401 for someone on the list who is not an admin, and data for a listed admin
- reviewer reads are logged
- with no salt configured, submit refuses to save

**Browser, on the local stack at phone width**
- the attendee and partner flows work
- switching back to anonymous wipes the typed name
- Back keeps answers
- keyboard-only answering works (Space selects, arrow keys move)
- focus moves to each new step
- moving focus to the first field with an error is in the code but was not re-checked in the browser after the last change
- a failed save shows an error, hides Edit, and lets the person resend only the identical answers; the resend lands once
- the results page loads for a reviewer, and the duplicate-company banner shows
- the Meta Pixel loads on the homepage but not on `/survey`

**Code checks**
- typecheck (`tsc -b`) passes
- lint on the new files passes
- `npm run test:survey` passes 19/19, and was confirmed to fail when the rules it checks are broken on purpose
- `vite build` passes
