import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

// Loads a TS module the way testAiPortal.mjs does: transpile, then evaluate
// with a require stub that resolves only the files we expect.
function load(path, modules = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const api = {};
  const requireStub = (name) => {
    if (name in modules) return modules[name];
    throw new Error(`unexpected import ${name}`);
  };
  new Function('exports', 'require', code)(api, requireStub);
  return api;
}

const schema = load('../supabase/functions/_shared/formula-survey-schema.ts');
const results = load('../src/lib/surveyResults.ts', {
  '../../supabase/functions/_shared/formula-survey-schema.ts': schema,
});

const KEY = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
const attendee = (extra = {}) => ({ submissionKey: KEY, audience: 'attendee', anonymity: 'anonymous', answers: {}, ...extra });
const partnerContact = { fullName: 'Pat Partner', email: 'Pat@Example.com', company: 'Acme Insurance Tech' };
const partner = (extra = {}) => ({
  submissionKey: KEY,
  audience: 'partner',
  anonymity: 'identified',
  contact: partnerContact,
  answers: {},
  ...extra,
});
const errorOf = (input) => {
  const result = schema.validateSubmission(input);
  return result.ok ? null : result.error;
};

test('session and event names match the agenda and Justin\'s rulings', () => {
  const agenda = fs.readFileSync(new URL('../src/config/agenda.ts', import.meta.url), 'utf8');
  const sessionsBlock = agenda.slice(agenda.indexOf('export const SESSIONS'), agenda.indexOf('export const BUILD_GROUPS'));
  const agendaTitles = [...sessionsBlock.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]).sort();
  const surveyTitles = schema.SESSION_ROWS.map((row) => row.label).filter((label) => label !== 'Garrett J. White').sort();
  assert.deepEqual(surveyTitles, agendaTitles);
  assert.equal(schema.SESSION_ROWS.length, 9);
  assert.ok(schema.SESSION_ROWS.some((row) => row.label === 'Garrett J. White'));
  assert.deepEqual(
    schema.EVENT_ROWS.map((row) => row.label),
    ['Registration and check-in', 'Venue', 'Poolside Cocktail Hour', 'Casino Night (Thursday)'],
  );
});

test('each survey has eleven numbered questions across four steps', () => {
  for (const audience of ['attendee', 'partner']) {
    const steps = schema.stepsFor(audience);
    assert.equal(steps.length, 4);
    const numbers = new Set(schema.questionsFor(audience).map((q) => q.number.replace(/[a-z]$/, '')));
    assert.deepEqual([...numbers].map(Number).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  }
});

test('anonymous attendee is accepted with no contact', () => {
  const result = schema.validateSubmission(attendee({ role: 'owner', answers: { a_q1_value: 'very' } }));
  assert.equal(result.ok, true);
  assert.equal(result.value.contact, null);
  assert.deepEqual(result.value.structured, { a_q1_value: 'very' });
});

test('anonymous payload carrying contact fields is refused', () => {
  assert.equal(errorOf(attendee({ contact: { fullName: 'A', email: 'a@b.co' } })), 'anonymous_with_contact');
  assert.equal(errorOf(attendee({ contact: {} })), 'anonymous_with_contact');
});

test('identified attendee needs a name and a valid email, agency optional', () => {
  const base = attendee({ anonymity: 'identified' });
  assert.equal(errorOf(base), 'contact_required');
  assert.equal(errorOf({ ...base, contact: { email: 'a@b.co' } }), 'name_required');
  assert.equal(errorOf({ ...base, contact: { fullName: 'Ann', email: 'not-an-email' } }), 'valid_email_required');
  const ok = schema.validateSubmission({ ...base, contact: { fullName: 'Ann', email: 'Ann@B.co', contactPermission: true } });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.value.contact, { fullName: 'Ann', email: 'ann@b.co', company: null, title: null, contactPermission: true });
  const noPermission = schema.validateSubmission({ ...base, contact: { fullName: 'Ann', email: 'ann@b.co' } });
  assert.equal(noPermission.value.contact.contactPermission, false);
});

test('partners cannot be anonymous and need company, name and email', () => {
  assert.equal(errorOf(partner({ anonymity: 'anonymous', contact: null })), 'partner_must_identify');
  assert.equal(errorOf(partner({ contact: { ...partnerContact, company: ' ' } })), 'company_required');
  assert.equal(errorOf(partner({ contact: { ...partnerContact, fullName: '' } })), 'name_required');
  assert.equal(errorOf(partner({ contact: { ...partnerContact, email: 'x@' } })), 'valid_email_required');
  assert.equal(errorOf(partner({ contact: { ...partnerContact, contactPermission: true } })), 'invalid_contact');
  assert.equal(errorOf(partner({ role: 'owner' })), 'invalid_role');
  assert.equal(schema.validateSubmission(partner()).ok, true);
});

test('Q5 above Q4 is refused; zero and unknowns stay distinct', () => {
  assert.equal(
    errorOf(partner({ answers: { p_q4_qualified_conversations: 3, p_q5_next_steps: 4 } })),
    'next_steps_exceed_conversations',
  );
  const zero = schema.validateSubmission(partner({ answers: { p_q4_qualified_conversations: 0, p_q5_next_steps: 0 } }));
  assert.deepEqual(zero.value.structured, { p_q4_qualified_conversations: 0, p_q5_next_steps: 0 });
  const unknown = schema.validateSubmission(
    partner({ answers: { p_q4_qualified_conversations: 'not_tracked', p_q5_next_steps: 12 } }),
  );
  assert.equal(unknown.ok, true);
  assert.equal(unknown.value.structured.p_q4_qualified_conversations, 'not_tracked');
  assert.equal(errorOf(partner({ answers: { p_q4_qualified_conversations: -1 } })), 'invalid_count');
  assert.equal(errorOf(partner({ answers: { p_q4_qualified_conversations: 2.5 } })), 'invalid_count');
});

test('skipped answers are not stored, never as zero', () => {
  const result = schema.validateSubmission(
    attendee({ answers: { a_q1_value: null, a_q10_attend_2027: undefined, a_q8_action: '   ', a_q4_sessions: { body: null } } }),
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.structured, {});
  assert.deepEqual(result.value.freeText, {});
  const zero = schema.validateSubmission(attendee({ answers: { a_q10_attend_2027: 0 } }));
  assert.equal(zero.value.structured.a_q10_attend_2027, 0);
});

test('unknown questions, options and grid rows are refused', () => {
  assert.equal(errorOf(attendee({ answers: { a_q1_value: 'amazing' } })), 'invalid_choice');
  assert.equal(errorOf(attendee({ answers: { a_q4_sessions: { keynote: 'very' } } })), 'invalid_grid');
  assert.equal(errorOf(attendee({ answers: { a_q4_sessions: { body: 'amazing' } } })), 'invalid_grid');
  assert.equal(errorOf(attendee({ answers: { a_q10_attend_2027: 11 } })), 'invalid_scale');
  assert.equal(errorOf(attendee({ answers: { p_q1_objective: 'other' } })), 'unknown_question');
  assert.equal(errorOf(attendee({ role: 'ceo' })), 'invalid_role');
  assert.equal(errorOf({ ...attendee(), submissionKey: 'abc' }), 'invalid_submission_key');
});

test('2027 dates: up to two windows, or exactly one of No preference / Neither', () => {
  for (const [audience, id] of [['attendee', 'a_q11_dates_2027'], ['partner', 'p_q11_dates_2027']]) {
    const base = audience === 'attendee' ? attendee : partner;
    const ok = schema.validateSubmission(base({ answers: { [id]: ['nov_second_half', 'sep_first_half'] } }));
    assert.deepEqual(ok.value.structured[id], ['sep_first_half', 'nov_second_half'], 'stored in option order');
    assert.equal(errorOf(base({ answers: { [id]: ['sep_first_half', 'sep_second_half', 'nov_first_half'] } })), 'too_many_choices');
    assert.equal(errorOf(base({ answers: { [id]: ['no_preference', 'sep_first_half'] } })), 'invalid_multi');
    assert.equal(errorOf(base({ answers: { [id]: ['neither', 'no_preference'] } })), 'invalid_multi');
    assert.equal(errorOf(base({ answers: { [id]: ['december'] } })), 'invalid_multi');
    assert.equal(errorOf(base({ answers: { [id]: 'sep_first_half' } })), 'invalid_multi');
    assert.deepEqual(schema.validateSubmission(base({ answers: { [id]: ['neither'] } })).value.structured[id], ['neither']);
    assert.deepEqual(schema.validateSubmission(base({ answers: { [id]: [] } })).value.structured, {}, 'empty = skipped');
  }
  const note = schema.validateSubmission(attendee({ answers: { a_q11_dates_note: 'Avoid the week of the 14th' } }));
  assert.equal(note.value.freeText.a_q11_dates_note, 'Avoid the week of the 14th');
  assert.equal(errorOf(attendee({ answers: { a_q11_dates_note: 'x'.repeat(schema.DATE_NOTE_MAX + 1) } })), 'text_too_long');
  assert.equal(schema.SURVEY_SCHEMA_VERSION, 2);
});

test('testimonials need text, a name and an explicit share choice', () => {
  const t = (extra = {}) => ({ type: 'testimonial', submissionKey: KEY, audience: 'attendee', body: 'Changed how I run my week.', fullName: 'Ann Lee', publishConsent: true, ...extra });
  const ok = schema.validateTestimonial(t({ email: 'Ann@B.co', company: 'Lee Agency' }));
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.value, {
    submissionKey: KEY, audience: 'attendee', body: 'Changed how I run my week.', mediaPath: null, mediaType: null,
    fullName: 'Ann Lee', company: 'Lee Agency', title: null, email: 'ann@b.co', publishConsent: true,
  });
  assert.equal(schema.validateTestimonial(t({ publishConsent: false })).value.publishConsent, false);
  assert.equal(schema.validateTestimonial(t({ body: '  ' })).error, 'testimonial_required');
  assert.equal(schema.validateTestimonial(t({ fullName: '' })).error, 'name_required');
  assert.equal(schema.validateTestimonial(t({ email: 'nope' })).error, 'valid_email_required');
  assert.equal(schema.validateTestimonial(t({ publishConsent: undefined })).error, 'publish_choice_required');
  assert.equal(schema.validateTestimonial(t({ body: 'x'.repeat(schema.TESTIMONIAL_MAX + 1) })).error, 'text_too_long');
  assert.equal(schema.validateTestimonial(t({ responseId: 'abc' })).error, 'invalid_testimonial', 'no way to link a response');
  assert.equal(schema.validateTestimonial(t({ audience: 'vendor' })).error, 'invalid_audience');
});

test('unknown answer keys are still refused', () => {
  assert.equal(errorOf(attendee({ answers: { date_preference: ['september_first_half'] } })), 'unknown_question');
  assert.equal(errorOf(attendee({ answers: { p_q11_dates_2027: ['neither'] } })), 'unknown_question');
});

test('free text over the limit is refused', () => {
  assert.equal(errorOf(attendee({ answers: { a_q8_action: 'x'.repeat(schema.TEXT_MAX + 1) } })), 'text_too_long');
  assert.equal(schema.validateSubmission(attendee({ answers: { a_q8_action: 'x'.repeat(schema.TEXT_MAX) } })).ok, true);
});

test('partner Q2 becomes not applicable when there was no objective', () => {
  const none = schema.validateSubmission(partner({ answers: { p_q1_objective: 'no_objective', p_q2_attainment: 'fully' } }));
  assert.equal(none.value.structured.p_q2_attainment, 'not_applicable');
  assert.equal(errorOf(partner({ answers: { p_q1_objective: 'new_business', p_q2_attainment: 'not_applicable' } })), 'invalid_choice');
  const other = schema.validateSubmission(
    partner({ answers: { p_q1_objective: 'new_business', p_q1_objective_other: 'leftover text' } }),
  );
  assert.equal(other.value.freeText.p_q1_objective_other, undefined);
});

// --------------------------------------------------------------------------- results

const row = (answers, extra = {}) => ({
  id: crypto.randomUUID(),
  audience: 'attendee',
  role: null,
  anonymity: 'anonymous',
  submittedAt: '2026-10-22T14:00:00Z',
  answers,
  freeText: {},
  schemaVersion: 1,
  contact: null,
  ...extra,
});

test('session usefulness uses an attended-and-rated denominator', () => {
  const rows = [
    row({ a_q4_sessions: { body: 'extremely' } }),
    row({ a_q4_sessions: { body: 'slightly' } }),
    row({ a_q4_sessions: { body: 'did_not_attend' } }),
    row({ a_q4_sessions: { body: 'unable_to_assess' } }),
    row({}),
  ];
  const body = results.gridDistributions(rows, 'attendee', 'a_q4_sessions').find((r) => r.rowId === 'body');
  assert.equal(body.distribution.responses, 5);
  assert.equal(body.distribution.answered, 4);
  assert.equal(body.distribution.scored, 2);
  assert.equal(body.distribution.unanswered, 1);
  assert.deepEqual(body.topTwo, { count: 1, of: 2, percent: 50 });
  const didNotAttend = body.distribution.bars.find((bar) => bar.value === 'did_not_attend');
  assert.equal(didNotAttend.count, 1);
  assert.equal(didNotAttend.percent, null);
});

test('attendance intent is a distribution and a median, never NPS', () => {
  const rows = [row({ a_q10_attend_2027: 10 }), row({ a_q10_attend_2027: 6 }), row({ a_q10_attend_2027: 'too_early' }), row({})];
  const summary = results.numericSummary(rows, 'attendee', 'a_q10_attend_2027');
  assert.equal(summary.numeric, 2);
  assert.equal(summary.median, 8);
  assert.equal(summary.unanswered, 1);
  assert.equal(summary.other.find((o) => o.value === 'too_early').count, 1);
  assert.equal(summary.points.length, 11);
  const page = fs.readFileSync(new URL('../src/pages/AdminSurveyResults.tsx', import.meta.url), 'utf8');
  assert.ok(!/promoter|detractor|nps\s*[=:(]/i.test(page + JSON.stringify(Object.keys(results))));
});

test('partner pipeline only adds companies that gave both numbers', () => {
  const rows = [
    row({ p_q4_qualified_conversations: 10, p_q5_next_steps: 3 }, { audience: 'partner' }),
    row({ p_q4_qualified_conversations: 'not_tracked', p_q5_next_steps: 2 }, { audience: 'partner' }),
  ];
  assert.deepEqual(results.partnerPipeline(rows), { companiesWithBoth: 1, conversations: 10, nextSteps: 3 });
});

test('duplicate partner companies are flagged', () => {
  const c = (company) => ({ fullName: 'X', email: 'x@y.co', company, title: null, contactPermission: null });
  const rows = [
    row({}, { audience: 'partner', contact: c('Acme') }),
    row({}, { audience: 'partner', contact: c(' acme ') }),
    row({}, { audience: 'partner', contact: c('Beta') }),
  ];
  assert.deepEqual(results.companyCount(rows), { companies: 2, duplicates: ['Acme'] });
});

test('CSV cells defuse spreadsheet formulas and the shareable file drops names and emails', () => {
  assert.equal(results.csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(results.csvCell('plain'), '"plain"');
  const identified = row(
    { a_q1_value: 'very' },
    { anonymity: 'identified', contact: { fullName: 'Ann Lee', email: 'ann@b.co', company: 'Lee Agency', title: null, contactPermission: true } },
  );
  const full = results.toCsv([identified], 'attendee', true);
  const shareable = results.toCsv([identified], 'attendee', false);
  assert.ok(full.includes('ann@b.co'));
  assert.ok(!shareable.includes('ann@b.co'));
  assert.ok(!shareable.includes('Ann Lee'));
  assert.ok(shareable.includes('Very valuable'));
});

test('NUL bytes and unpaired surrogates are dropped before they can fail a save', () => {
  const result = schema.validateSubmission(attendee({ answers: { a_q8_action: 'Hired\u0000 a coach \uD800' } }));
  assert.equal(result.ok, true);
  assert.equal(result.value.freeText.a_q8_action, 'Hired a coach');
  const emoji = schema.validateSubmission(attendee({ answers: { a_q8_action: 'Booked 3 demos \u{1F525}' } }));
  assert.equal(emoji.value.freeText.a_q8_action, 'Booked 3 demos \u{1F525}');
});

test('partner figures use one response per company, the latest received', () => {
  const c = (company, receivedAt) => ({ fullName: 'X', email: 'x@y.co', company, title: null, contactPermission: null, receivedAt });
  const older = row({ p_q4_qualified_conversations: 10, p_q5_next_steps: 2 }, { audience: 'partner', contact: c('Acme', '2026-10-22T14:05:00Z') });
  const newer = row({ p_q4_qualified_conversations: 12, p_q5_next_steps: 4 }, { audience: 'partner', contact: c('ACME ', '2026-10-22T15:30:00Z') });
  const beta = row({ p_q4_qualified_conversations: 3, p_q5_next_steps: 1 }, { audience: 'partner', contact: c('Beta', '2026-10-22T14:00:00Z') });
  const { rows, excluded } = results.latestPerCompany([older, newer, beta]);
  assert.equal(excluded, 1);
  assert.deepEqual(results.partnerPipeline(rows), { companiesWithBoth: 2, conversations: 15, nextSteps: 5 });
});

test('date results count each window once per person, with answered as the denominator', () => {
  const rows = [
    row({ a_q11_dates_2027: ['sep_first_half', 'nov_first_half'] }),
    row({ a_q11_dates_2027: ['sep_first_half'] }),
    row({ a_q11_dates_2027: ['neither'] }),
    row({}),
  ];
  const d = results.multiDistribution(rows, 'attendee', 'a_q11_dates_2027');
  assert.equal(d.answered, 3);
  assert.equal(d.unanswered, 1);
  const sep = d.bars.find((b) => b.value === 'sep_first_half');
  assert.deepEqual([sep.count, sep.percent], [2, 66.7]);
  assert.equal(d.bars.find((b) => b.value === 'neither').count, 1);
});

test('testimonials CSV marks the share choice and drops emails from the shareable file', () => {
  const rows = [{ id: '1', audience: 'attendee', body: '=cmd()', fullName: 'Ann', company: null, title: null, email: 'ann@b.co', publishConsent: false, submittedAt: '2026-10-22T14:00:00Z' }];
  const full = results.testimonialsCsv(rows, true);
  const share = results.testimonialsCsv(rows, false);
  assert.ok(full.includes('ann@b.co'));
  assert.ok(!share.includes('ann@b.co'));
  assert.ok(share.includes('no, internal only'));
  assert.ok(share.includes("\"'=cmd()\""), 'formula defused');
});

test('video/audio testimonials: allowed types and size, path derived from the testimonial key only', () => {
  const up = (extra = {}) => schema.validateUploadRequest({ type: 'testimonial-upload', submissionKey: KEY, mimeType: 'video/quicktime', sizeBytes: 1000, ...extra });
  assert.deepEqual(up().value, { submissionKey: KEY, mimeType: 'video/quicktime', path: `testimonials/${KEY}.mov` });
  assert.equal(up({ mimeType: 'audio/x-m4a' }).value.path, `testimonials/${KEY}.m4a`);
  assert.equal(up({ mimeType: 'application/pdf' }).error, 'unsupported_file_type');
  assert.equal(up({ mimeType: 'image/png' }).error, 'unsupported_file_type');
  assert.equal(up({ sizeBytes: schema.TESTIMONIAL_MEDIA_MAX_BYTES + 1 }).error, 'file_too_large');
  assert.equal(up({ sizeBytes: 0 }).error, 'invalid_file');
  assert.equal(up({ submissionKey: '../etc' }).error, 'invalid_submission_key');

  const t = (extra = {}) => ({ type: 'testimonial', submissionKey: KEY, audience: 'partner', fullName: 'Pat', publishConsent: false, ...extra });
  const fileOnly = schema.validateTestimonial(t({ mediaType: 'video/mp4' }));
  assert.equal(fileOnly.ok, true, 'a file alone is enough');
  assert.equal(fileOnly.value.body, null);
  assert.equal(fileOnly.value.mediaPath, `testimonials/${KEY}.mp4`);
  assert.equal(schema.validateTestimonial(t({ mediaType: 'video/mp4', body: 'Short note' })).value.body, 'Short note');
  assert.equal(schema.validateTestimonial(t()).error, 'testimonial_required', 'neither text nor file');
  assert.equal(schema.validateTestimonial(t({ mediaType: 'text/html' })).error, 'unsupported_file_type');
  assert.equal(schema.validateTestimonial(t({ mediaType: 'video/mp4', mediaPath: 'testimonials/other.mp4' })).error, 'invalid_testimonial', 'client cannot pick the path');
});

test('testimonials CSV names the stored file but never a playback link', () => {
  const rows = [{ id: '1', audience: 'partner', body: null, mediaPath: `testimonials/${KEY}.mp4`, mediaType: 'video/mp4', mediaUrl: '/storage/v1/object/sign/x?token=secret', fullName: 'Pat', company: 'Acme', title: null, email: null, publishConsent: true, submittedAt: '2026-10-22T14:00:00Z' }];
  const csv = results.testimonialsCsv(rows, true);
  assert.ok(csv.includes(`video/mp4 (testimonials/${KEY}.mp4)`));
  assert.ok(!csv.includes('token=secret'));
});
