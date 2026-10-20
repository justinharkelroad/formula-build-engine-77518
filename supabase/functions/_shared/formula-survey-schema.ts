// Formula 2026 post-event surveys: the single definition of every question,
// option and validation rule. The website renders from it and the
// formula-survey-submit function validates against it, so the two cannot drift.
//
// Keep this file import-free: it is loaded by Deno (edge functions), Vite
// (src/lib/formulaSurvey.ts) and node --test (scripts/testFormulaSurvey.mjs).
//
// Answer rules:
// - An unanswered question is ABSENT from `answers`. It is never stored as 0,
//   "", or a default choice.
// - "Did not attend", "Unsure", "Not tracked", "Not applicable" and 0 are all
//   distinct stored values.
// - Session names come from src/config/agenda.ts plus Garrett J. White's
//   main-stage slot. Evening events use the names printed on the agenda.

export const SURVEY_SCHEMA_VERSION = 1;

export type Audience = "attendee" | "partner";
export type AnonymityMode = "anonymous" | "identified";

export interface SurveyOption {
  value: string;
  label: string;
  /** Asks for a short "please specify" text, stored as `<questionId>_other`. */
  specify?: boolean;
}

interface QuestionBase {
  id: string;
  /** Printed number, e.g. "6b". */
  number: string;
  prompt: string;
  helper?: string;
}

export interface ChoiceQuestion extends QuestionBase {
  kind: "choice";
  options: SurveyOption[];
}

export interface GridQuestion extends QuestionBase {
  kind: "grid";
  rows: { id: string; label: string }[];
  options: SurveyOption[];
}

/** Whole number 0..max, or one of the non-numeric extras. */
export interface ScaleQuestion extends QuestionBase {
  kind: "scale";
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  extras: SurveyOption[];
}

/** Nonnegative whole number (zero allowed), or one of the non-numeric extras. */
export interface CountQuestion extends QuestionBase {
  kind: "count";
  max: number;
  extras: SurveyOption[];
}

export interface TextQuestion extends QuestionBase {
  kind: "text";
  maxLength: number;
}

export type SurveyQuestion = ChoiceQuestion | GridQuestion | ScaleQuestion | CountQuestion | TextQuestion;

export interface SurveyStep {
  id: string;
  title: string;
  /** Step 1 of each survey also carries the identity block. */
  questions: SurveyQuestion[];
}

export const TEXT_MAX = 2000;
export const SPECIFY_MAX = 200;
export const COUNT_MAX = 5000;

const value = (prefix: string) =>
  [
    { value: "not_at_all", label: `Not at all ${prefix}` },
    { value: "slightly", label: `Slightly ${prefix}` },
    { value: "moderately", label: `Moderately ${prefix}` },
    { value: "very", label: `Very ${prefix}` },
    { value: "extremely", label: `Extremely ${prefix}` },
  ];

const UNABLE: SurveyOption = { value: "unable_to_assess", label: "Unable to assess" };

// ---------------------------------------------------------------------------
// Attendee survey
// ---------------------------------------------------------------------------

export const ATTENDEE_ROLES: SurveyOption[] = [
  { value: "owner", label: "Agency owner/principal" },
  { value: "team_member", label: "Agency team member" },
  { value: "other", label: "Other attendee" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const SESSION_ROWS = [
  { id: "sales_sequence", label: "The Sales Sequence" },
  { id: "growth_through_service", label: "Growth Through Service" },
  { id: "body", label: "The Body Session" },
  { id: "operating_system", label: "The Operating System" },
  { id: "training", label: "Commitment to Training" },
  { id: "garrett", label: "Garrett J. White" },
  { id: "balance", label: "The Balance Session" },
  { id: "making_it_rain", label: "Making It Rain" },
  { id: "being", label: "The Being Session" },
];

export const EVENT_ROWS = [
  { id: "registration", label: "Registration and check-in" },
  { id: "venue", label: "Venue" },
  { id: "cocktail_hour", label: "Poolside Cocktail Hour" },
  { id: "thursday_night", label: "Formula Thursday Night" },
];

const A_Q1: ChoiceQuestion = {
  kind: "choice",
  id: "a_q1_value",
  number: "1",
  prompt: "Overall, how valuable was attending Formula 2026 to you?",
  options: [...value("valuable"), UNABLE],
};

const A_Q2: ChoiceQuestion = {
  kind: "choice",
  id: "a_q2_plan",
  number: "2",
  prompt: "Which best describes the 2027 business plan you left Formula with?",
  options: [
    { value: "no_plan", label: "No plan" },
    { value: "ideas_no_targets", label: "Ideas or notes, but no written targets" },
    {
      value: "targets_unresolved",
      label: "Written targets, but the people responsible or measures were still unresolved",
    },
    { value: "targets_owners_measures", label: "Written targets with clear people responsible and measures" },
    { value: "not_applicable", label: "Business planning was not applicable to my participation" },
    UNABLE,
  ],
};

const A_Q3: ChoiceQuestion = {
  kind: "choice",
  id: "a_q3_alignment",
  number: "3",
  prompt:
    "Compared with before Formula, how aligned are you and the colleagues who attended on your 2027 business priorities?",
  options: [
    { value: "much_less", label: "Much less aligned" },
    { value: "somewhat_less", label: "Somewhat less aligned" },
    { value: "no_change", label: "No change" },
    { value: "somewhat_more", label: "Somewhat more aligned" },
    { value: "much_more", label: "Much more aligned" },
    { value: "no_colleagues", label: "I attended without agency colleagues" },
    UNABLE,
  ],
};

const A_Q4: GridQuestion = {
  kind: "grid",
  id: "a_q4_sessions",
  number: "4",
  prompt: "How useful was each session to you?",
  helper: "Rate each one separately. Choose \"Did not attend\" for any session you missed.",
  rows: SESSION_ROWS,
  options: [
    ...value("useful"),
    { value: "did_not_attend", label: "Did not attend" },
    UNABLE,
  ],
};

const A_Q5: ChoiceQuestion = {
  kind: "choice",
  id: "a_q5_connections",
  number: "5",
  prompt: "How valuable were the connections you made or strengthened at Formula?",
  options: [
    ...value("valuable"),
    { value: "none_made", label: "I did not make or strengthen any connections" },
    UNABLE,
  ],
};

const A_Q6A: ChoiceQuestion = {
  kind: "choice",
  id: "a_q6a_pace",
  number: "6a",
  prompt: "Programming pace",
  options: [
    { value: "much_too_slow", label: "Much too slow" },
    { value: "somewhat_too_slow", label: "Somewhat too slow" },
    { value: "about_right", label: "About right" },
    { value: "somewhat_too_fast", label: "Somewhat too fast" },
    { value: "much_too_fast", label: "Much too fast" },
    UNABLE,
  ],
};

const A_Q6B: ChoiceQuestion = {
  kind: "choice",
  id: "a_q6b_workbook_time",
  number: "6b",
  prompt: "Time for workbook work",
  options: [
    { value: "much_too_little", label: "Much too little" },
    { value: "somewhat_too_little", label: "Somewhat too little" },
    { value: "about_right", label: "About right" },
    { value: "somewhat_too_much", label: "Somewhat too much" },
    { value: "much_too_much", label: "Much too much" },
    { value: "did_not_use", label: "Did not use workbook" },
    UNABLE,
  ],
};

const A_Q6C: GridQuestion = {
  kind: "grid",
  id: "a_q6c_event",
  number: "6c",
  prompt: "Rate each part of the event",
  rows: EVENT_ROWS,
  options: [
    { value: "poor", label: "Poor" },
    { value: "fair", label: "Fair" },
    { value: "good", label: "Good" },
    { value: "very_good", label: "Very good" },
    { value: "excellent", label: "Excellent" },
    { value: "not_applicable", label: "Did not participate / Not applicable" },
    UNABLE,
  ],
};

const A_Q6D: ChoiceQuestion = {
  kind: "choice",
  id: "a_q6d_destiny_rescue",
  number: "6d",
  prompt: "Destiny Rescue experience",
  options: [
    ...value("meaningful"),
    { value: "did_not_participate", label: "Did not participate" },
    UNABLE,
  ],
};

const A_Q7: ChoiceQuestion = {
  kind: "choice",
  id: "a_q7_app",
  number: "7",
  prompt: "Which best describes your experience turning workbook pages into saved plans using the Formula app?",
  options: [
    { value: "saved_no_difficulty", label: "Saved at least one useful plan without difficulty" },
    { value: "saved_with_difficulty", label: "Saved at least one useful plan, but experienced difficulty" },
    { value: "tried_no_plan", label: "Tried, but did not end up with a useful saved plan" },
    { value: "knew_did_not_try", label: "Knew about the feature but did not try it" },
    { value: "did_not_know", label: "Did not know the feature was available" },
    { value: "unable_to_assess", label: "Do not remember or unable to assess" },
  ],
};

const A_Q8: TextQuestion = {
  kind: "text",
  id: "a_q8_action",
  number: "8",
  prompt: "What is one specific action, if any, you have already taken because of Formula?",
  helper:
    "This can involve Business, Body, Being, or Balance. \"No action yet\" is a valid answer. Describe what you actually did, not only what you intend to do.",
  maxLength: TEXT_MAX,
};

const A_Q9: TextQuestion = {
  kind: "text",
  id: "a_q9_reduced_value",
  number: "9",
  prompt: "What, if anything, most reduced the value of your Formula experience?",
  helper:
    "Describe the specific part of the experience and what happened. \"Nothing reduced the value\" is a valid answer.",
  maxLength: TEXT_MAX,
};

const A_Q10: ScaleQuestion = {
  kind: "scale",
  id: "a_q10_attend_2027",
  number: "10",
  prompt: "How likely are you to attend Formula in 2027?",
  min: 0,
  max: 10,
  minLabel: "Not at all likely",
  maxLabel: "Extremely likely",
  extras: [
    { value: "too_early", label: "Too early to assess" },
    { value: "not_my_decision", label: "Attendance is not my decision" },
  ],
};

export const ATTENDEE_STEPS: SurveyStep[] = [
  { id: "about", title: "About you and your plan", questions: [A_Q1, A_Q2, A_Q3] },
  { id: "sessions", title: "Sessions and connections", questions: [A_Q4, A_Q5] },
  { id: "event", title: "The event experience", questions: [A_Q6A, A_Q6B, A_Q6C, A_Q6D, A_Q7] },
  { id: "results", title: "What happened next", questions: [A_Q8, A_Q9, A_Q10] },
];

export const ATTENDEE_Q6_HEADING = "6. How did the pacing and other parts of the event work for you?";

// ---------------------------------------------------------------------------
// Partner survey
// ---------------------------------------------------------------------------

const COUNT_EXTRAS: SurveyOption[] = [
  { value: "not_tracked", label: "Not tracked" },
  { value: "unsure", label: "Unsure" },
  { value: "prefer_not_to_answer", label: "Prefer not to answer" },
];

export const QUALIFIED_CONVERSATION_DEFINITION =
  "An agency fits your offering and discussed a specific need or opportunity. Count each agency once for your company, even when several people from your team spoke with it.";

const P_Q1: ChoiceQuestion = {
  kind: "choice",
  id: "p_q1_objective",
  number: "1",
  prompt: "What was your company's primary reason for partnering with Formula?",
  helper: "Choose one.",
  options: [
    { value: "new_business", label: "Generate new business" },
    { value: "existing_clients", label: "Strengthen existing-client relationships" },
    { value: "brand_awareness", label: "Build brand awareness" },
    { value: "strategic_partnerships", label: "Develop strategic partnerships" },
    { value: "understand_agencies", label: "Better understand agency needs" },
    { value: "support_community", label: "Support the Formula community" },
    { value: "other", label: "Other (specify)", specify: true },
    { value: "no_objective", label: "No specific objective" },
  ],
};

/** Stored automatically when Q1 is "No specific objective"; never offered as a choice. */
export const P_Q2_NOT_APPLICABLE = "not_applicable";

const P_Q2: ChoiceQuestion = {
  kind: "choice",
  id: "p_q2_attainment",
  number: "2",
  prompt: "To what extent did Formula meet that primary objective?",
  options: [
    { value: "not_at_all", label: "Not at all" },
    { value: "a_little", label: "A little" },
    { value: "partly", label: "Partly" },
    { value: "mostly", label: "Mostly" },
    { value: "fully", label: "Fully" },
    { value: "too_early", label: "Too early to assess" },
    UNABLE,
  ],
};

const P_Q3: ChoiceQuestion = {
  kind: "choice",
  id: "p_q3_fit",
  number: "3",
  prompt: "How well did the agencies you interacted with fit your target customer profile?",
  options: [
    { value: "not_at_all", label: "Not at all" },
    { value: "slightly", label: "Slightly" },
    { value: "moderately", label: "Moderately" },
    { value: "very_well", label: "Very well" },
    { value: "extremely_well", label: "Extremely well" },
    { value: "no_interactions", label: "No agency interactions" },
    UNABLE,
    { value: "not_applicable", label: "Not applicable to our objective" },
  ],
};

const P_Q4: CountQuestion = {
  kind: "count",
  id: "p_q4_qualified_conversations",
  number: "4",
  prompt:
    "Approximately how many different agencies did your team have a qualified business conversation with during Formula?",
  helper: QUALIFIED_CONVERSATION_DEFINITION,
  max: COUNT_MAX,
  extras: COUNT_EXTRAS,
};

const P_Q5: CountQuestion = {
  kind: "count",
  id: "p_q5_next_steps",
  number: "5",
  prompt: "Of those agencies, how many have agreed to a specific next step with your company as of today?",
  helper: "Examples: a scheduled demo, a follow-up meeting, a requested proposal. Zero is a valid answer.",
  max: COUNT_MAX,
  extras: COUNT_EXTRAS,
};

const P_Q6: ChoiceQuestion = {
  kind: "choice",
  id: "p_q6_connect_time",
  number: "6",
  prompt: "How did the time available to connect with attendees compare with what your team needed?",
  options: [
    { value: "much_too_little", label: "Much too little" },
    { value: "somewhat_too_little", label: "Somewhat too little" },
    { value: "about_right", label: "About right" },
    { value: "somewhat_too_much", label: "Somewhat too much" },
    { value: "much_too_much", label: "Much too much" },
    UNABLE,
  ],
};

const P_Q7: ChoiceQuestion = {
  kind: "choice",
  id: "p_q7_package",
  number: "7",
  prompt:
    "Which best describes delivery of the benefits in your partnership package that were due by the end of the event?",
  helper: "If anything was missing, tell us what in question 10.",
  options: [
    { value: "all_delivered", label: "All delivered" },
    { value: "some_missing", label: "Some missing" },
    { value: "none_delivered", label: "None delivered" },
    { value: "none_due", label: "No benefits were due by then" },
    UNABLE,
  ],
};

const P_Q8: TextQuestion = {
  kind: "text",
  id: "p_q8_most_value",
  number: "8",
  prompt: "What, if anything, created the most value for your company at Formula?",
  helper:
    "Describe a specific interaction, opportunity, or experience. Please leave out customer names and confidential deal details.",
  maxLength: TEXT_MAX,
};

const P_Q9: ChoiceQuestion = {
  kind: "choice",
  id: "p_q9_renewal",
  number: "9",
  prompt: "For a comparable package and investment, how likely would your company be to partner with Formula again?",
  options: [
    { value: "very_unlikely", label: "Very unlikely" },
    { value: "somewhat_unlikely", label: "Somewhat unlikely" },
    { value: "neutral", label: "Neither likely nor unlikely" },
    { value: "somewhat_likely", label: "Somewhat likely" },
    { value: "very_likely", label: "Very likely" },
    { value: "too_early", label: "Too early to assess" },
    { value: "not_involved", label: "Not involved in that decision" },
  ],
};

const P_Q10: TextQuestion = {
  kind: "text",
  id: "p_q10_limited_value",
  number: "10",
  prompt: "What, if anything, most limited the value your company received from its partnership?",
  helper: "Name the specific issue and its effect, including any missing package benefits.",
  maxLength: TEXT_MAX,
};

export const PARTNER_STEPS: SurveyStep[] = [
  { id: "company", title: "Your company", questions: [] },
  { id: "objective", title: "Your objective", questions: [P_Q1, P_Q2, P_Q3] },
  { id: "pipeline", title: "Conversations and delivery", questions: [P_Q4, P_Q5, P_Q6, P_Q7] },
  { id: "value", title: "Value and next year", questions: [P_Q8, P_Q9, P_Q10] },
];

// ---------------------------------------------------------------------------
// Copy shown on the page
// ---------------------------------------------------------------------------

export const SURVEY_COPY = {
  title: "Formula 2026 Feedback",
  description: "Help us understand what delivered value and where the experience fell short.",
  attendeeChoice: "I attended Formula",
  partnerChoice: "My company partnered with Formula",
  attendeeIntro:
    "Tell us what Formula delivered for you, what you have put into practice, and where the experience fell short. Answer from your own experience. You may skip any feedback question. Please do not include customer information or sensitive details about another person.",
  partnerIntro:
    "Tell us how Formula 2026 performed against your company's reason for partnering. We want to understand the value received, business opportunities developed, and gaps in the partnership experience. Report what you know today. Use \"Too early to assess,\" \"Not tracked,\" or \"Unsure\" where appropriate. Please do not include customer names or confidential deal details.",
  partnerIdentityNotice:
    "Partner responses include your name, company, and email. Authorized Formula feedback reviewers will use this information to understand your company's experience and follow up on partnership-related issues. Please submit one consolidated response for your company, including your team's combined conversation counts.",
  attendeePrivacy:
    "Your answers are anonymous unless you choose to include your name. Anonymous answers are not linked to your registration, your email, or the Formula app, and this survey runs no advertising or analytics trackers.",
  freeTextWarning:
    "Anything you type in a comment box could identify you. Leave out details you don't want tied to you.",
  technicalDataNotice:
    "Our hosting and security systems process technical connection data, such as your IP address, separately to run the form and stop abuse. It is not stored with your answers.",
  contactPermission: "The Formula team may contact me about this feedback.",
};

// ---------------------------------------------------------------------------
// Validation (shared by the page and the submit function)
// ---------------------------------------------------------------------------

export interface SurveyContact {
  fullName: string;
  email: string;
  /** Agency name for attendees, company name for partners. */
  company: string | null;
  title: string | null;
  /** Attendees only. Partners are always followed up with, so this is null. */
  contactPermission: boolean | null;
}

export type AnswerValue = string | number | Record<string, string>;

export interface NormalizedSubmission {
  submissionKey: string;
  audience: Audience;
  role: string | null;
  anonymity: AnonymityMode;
  structured: Record<string, AnswerValue>;
  freeText: Record<string, string>;
  contact: SurveyContact | null;
  schemaVersion: number;
}

export type ValidationResult =
  | { ok: true; value: NormalizedSubmission }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function stepsFor(audience: Audience): SurveyStep[] {
  return audience === "attendee" ? ATTENDEE_STEPS : PARTNER_STEPS;
}

export function questionsFor(audience: Audience): SurveyQuestion[] {
  return stepsFor(audience).flatMap((step) => step.questions);
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Postgres refuses NUL and unpaired UTF-16 surrogates in text/jsonb, which
// would turn every retry into the same save failure. Drop them up front.
// eslint-disable-next-line no-control-regex -- matching NUL is the point
const UNSTORABLE_RE = /\u0000|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

function cleanText(value: unknown, max: number): string | null | "too_long" {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return "too_long";
  const trimmed = value.replace(UNSTORABLE_RE, "").trim();
  if (!trimmed) return null;
  return trimmed.length > max ? "too_long" : trimmed;
}

function optionValues(options: SurveyOption[]): Set<string> {
  return new Set(options.map((option) => option.value));
}

/** Pure validation. Returns normalized answers or the first error code. */
export function validateSubmission(input: unknown): ValidationResult {
  if (!isPlainObject(input)) return { ok: false, error: "invalid_body" };

  const submissionKey = typeof input.submissionKey === "string" ? input.submissionKey : "";
  if (!UUID_RE.test(submissionKey)) return { ok: false, error: "invalid_submission_key" };

  const audience = input.audience;
  if (audience !== "attendee" && audience !== "partner") return { ok: false, error: "invalid_audience" };

  const anonymity = input.anonymity;
  if (anonymity !== "anonymous" && anonymity !== "identified") return { ok: false, error: "invalid_anonymity" };
  if (audience === "partner" && anonymity !== "identified") return { ok: false, error: "partner_must_identify" };

  let role: string | null = null;
  if (input.role !== undefined && input.role !== null) {
    if (audience !== "attendee" || typeof input.role !== "string" || !optionValues(ATTENDEE_ROLES).has(input.role)) {
      return { ok: false, error: "invalid_role" };
    }
    role = input.role;
  }

  // Contact details: required for partners and identified attendees, and
  // refused outright for anonymous responses so nothing identifying is kept.
  let contact: SurveyContact | null = null;
  const rawContact = input.contact;
  if (anonymity === "anonymous") {
    if (rawContact !== undefined && rawContact !== null) return { ok: false, error: "anonymous_with_contact" };
  } else {
    if (!isPlainObject(rawContact)) return { ok: false, error: "contact_required" };
    const allowed = new Set(["fullName", "email", "company", "title", "contactPermission"]);
    if (Object.keys(rawContact).some((key) => !allowed.has(key))) return { ok: false, error: "invalid_contact" };

    const fullName = cleanText(rawContact.fullName, 120);
    const email = cleanText(rawContact.email, 254);
    const company = cleanText(rawContact.company, 160);
    const title = cleanText(rawContact.title, 120);
    if (fullName === "too_long" || email === "too_long" || company === "too_long" || title === "too_long") {
      return { ok: false, error: "contact_too_long" };
    }
    if (!fullName) return { ok: false, error: "name_required" };
    if (!email || !isValidEmail(email)) return { ok: false, error: "valid_email_required" };
    if (audience === "partner" && !company) return { ok: false, error: "company_required" };
    if (audience === "attendee" && title) return { ok: false, error: "invalid_contact" };

    let contactPermission: boolean | null = null;
    if (audience === "attendee") {
      if (rawContact.contactPermission !== undefined && typeof rawContact.contactPermission !== "boolean") {
        return { ok: false, error: "invalid_contact" };
      }
      contactPermission = rawContact.contactPermission === true;
    } else if (rawContact.contactPermission !== undefined && rawContact.contactPermission !== null) {
      return { ok: false, error: "invalid_contact" };
    }

    contact = { fullName, email: email.toLowerCase(), company, title, contactPermission };
  }

  const answers = input.answers === undefined ? {} : input.answers;
  if (!isPlainObject(answers)) return { ok: false, error: "invalid_answers" };

  const questions = questionsFor(audience);
  const byId = new Map(questions.map((question) => [question.id, question]));
  const specifyKeys = new Map<string, ChoiceQuestion>();
  for (const question of questions) {
    if (question.kind === "choice" && question.options.some((option) => option.specify)) {
      specifyKeys.set(`${question.id}_other`, question);
    }
  }

  const structured: Record<string, AnswerValue> = {};
  const freeText: Record<string, string> = {};

  for (const [key, raw] of Object.entries(answers)) {
    // A null/undefined answer means "skipped" and is simply not stored.
    if (raw === null || raw === undefined) continue;

    const specifyFor = specifyKeys.get(key);
    if (specifyFor) {
      const cleaned = cleanText(raw, SPECIFY_MAX);
      if (cleaned === "too_long") return { ok: false, error: "text_too_long" };
      if (cleaned) freeText[key] = cleaned;
      continue;
    }

    const question = byId.get(key);
    if (!question) return { ok: false, error: "unknown_question" };

    switch (question.kind) {
      case "choice": {
        if (typeof raw !== "string") return { ok: false, error: "invalid_choice" };
        const allowed = optionValues(question.options);
        if (question.id === "p_q2_attainment") allowed.add(P_Q2_NOT_APPLICABLE);
        if (!allowed.has(raw)) return { ok: false, error: "invalid_choice" };
        structured[key] = raw;
        break;
      }
      case "grid": {
        if (!isPlainObject(raw)) return { ok: false, error: "invalid_grid" };
        const rowIds = new Set(question.rows.map((row) => row.id));
        const allowed = optionValues(question.options);
        const rows: Record<string, string> = {};
        for (const [rowId, cell] of Object.entries(raw)) {
          if (!rowIds.has(rowId)) return { ok: false, error: "invalid_grid" };
          if (cell === null || cell === undefined) continue;
          if (typeof cell !== "string" || !allowed.has(cell)) return { ok: false, error: "invalid_grid" };
          rows[rowId] = cell;
        }
        if (Object.keys(rows).length) structured[key] = rows;
        break;
      }
      case "scale": {
        if (typeof raw === "number") {
          if (!Number.isInteger(raw) || raw < question.min || raw > question.max) {
            return { ok: false, error: "invalid_scale" };
          }
        } else if (typeof raw !== "string" || !optionValues(question.extras).has(raw)) {
          return { ok: false, error: "invalid_scale" };
        }
        structured[key] = raw;
        break;
      }
      case "count": {
        if (typeof raw === "number") {
          if (!Number.isInteger(raw) || raw < 0 || raw > question.max) return { ok: false, error: "invalid_count" };
        } else if (typeof raw !== "string" || !optionValues(question.extras).has(raw)) {
          return { ok: false, error: "invalid_count" };
        }
        structured[key] = raw;
        break;
      }
      case "text": {
        const cleaned = cleanText(raw, question.maxLength);
        if (cleaned === "too_long") return { ok: false, error: "text_too_long" };
        if (cleaned) freeText[key] = cleaned;
        break;
      }
    }
  }

  if (audience === "partner") {
    // "Other (specify)" text only counts when Other was chosen.
    if (freeText.p_q1_objective_other && structured.p_q1_objective !== "other") {
      delete freeText.p_q1_objective_other;
    }
    // Q2 is not applicable when there was no objective to meet.
    if (structured.p_q1_objective === "no_objective") {
      structured.p_q2_attainment = P_Q2_NOT_APPLICABLE;
    } else if (structured.p_q2_attainment === P_Q2_NOT_APPLICABLE) {
      return { ok: false, error: "invalid_choice" };
    }
    const q4 = structured.p_q4_qualified_conversations;
    const q5 = structured.p_q5_next_steps;
    if (typeof q4 === "number" && typeof q5 === "number" && q5 > q4) {
      return { ok: false, error: "next_steps_exceed_conversations" };
    }
  }

  return {
    ok: true,
    value: {
      submissionKey: submissionKey.toLowerCase(),
      audience,
      role,
      anonymity,
      structured,
      freeText,
      contact,
      schemaVersion: SURVEY_SCHEMA_VERSION,
    },
  };
}

/** Plain-language messages for the error codes above. */
export const SURVEY_ERROR_MESSAGES: Record<string, string> = {
  name_required: "Please enter your full name.",
  valid_email_required: "Please enter a valid email address.",
  company_required: "Please enter your company name.",
  next_steps_exceed_conversations:
    "Question 5 can't be higher than question 4. Agreed next steps come from the agencies you had qualified conversations with.",
  text_too_long: `Comments can be up to ${TEXT_MAX} characters.`,
  rate_limited: "Too many submissions from this connection. Please wait a few minutes and try again.",
};
