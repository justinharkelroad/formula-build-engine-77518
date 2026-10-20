// Aggregation and CSV export for /admin/survey-results.
//
// Reporting rules from the survey brief, enforced here so the page cannot get
// them wrong:
// - Every figure carries its counts and its denominator.
// - Blank, unknown, not-applicable and did-not-attend answers are counted and
//   shown, but never scored and never part of a percentage's denominator.
// - Attendance intent is reported as a distribution and a median. No NPS.
// - Partner next steps are reported as counts, not as sales.
import {
  ATTENDEE_ROLES,
  questionsFor,
  type Audience,
  type SurveyOption,
  type SurveyQuestion,
} from "../../supabase/functions/_shared/formula-survey-schema.ts";

export interface SurveyContactRow {
  fullName: string;
  email: string;
  company: string | null;
  title: string | null;
  contactPermission: boolean | null;
  /** Exact receipt time; identified responses only. */
  receivedAt?: string;
}

export interface SurveyResponseRow {
  id: string;
  audience: Audience;
  role: string | null;
  anonymity: "anonymous" | "identified";
  submittedAt: string;
  answers: Record<string, unknown>;
  freeText: Record<string, string>;
  schemaVersion: number;
  contact: SurveyContactRow | null;
}

/** Answers that are real information but not a point on the scale. */
export const NON_SCORED = new Set([
  "unable_to_assess",
  "did_not_attend",
  "did_not_participate",
  "not_applicable",
  "did_not_use",
  "none_made",
  "no_colleagues",
  "no_interactions",
  "too_early",
  "not_my_decision",
  "not_involved",
  "not_tracked",
  "unsure",
  "prefer_not_to_answer",
  "none_due",
  "no_objective",
  "prefer_not_to_say",
]);

export interface DistributionBar {
  value: string;
  label: string;
  count: number;
  /** Share of scored answers; null for answers that are not scored. */
  percent: number | null;
  scored: boolean;
}

export interface Distribution {
  /** Responses that were shown this question. */
  responses: number;
  /** Responses that gave any answer. */
  answered: number;
  /** Answered with a point on the scale (the percentage denominator). */
  scored: number;
  unanswered: number;
  bars: DistributionBar[];
}

function pct(count: number, of: number): number | null {
  return of > 0 ? Math.round((count / of) * 1000) / 10 : null;
}

export function distributionOf(values: unknown[], options: SurveyOption[], responses: number): Distribution {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const answered = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const scored = options
    .filter((option) => !NON_SCORED.has(option.value))
    .reduce((sum, option) => sum + (counts.get(option.value) ?? 0), 0);
  return {
    responses,
    answered,
    scored,
    unanswered: responses - answered,
    bars: options.map((option) => {
      const count = counts.get(option.value) ?? 0;
      const isScored = !NON_SCORED.has(option.value);
      return { value: option.value, label: option.label, count, scored: isScored, percent: isScored ? pct(count, scored) : null };
    }),
  };
}

export function byAudience(rows: SurveyResponseRow[], audience: Audience): SurveyResponseRow[] {
  return rows.filter((row) => row.audience === audience);
}

function question(audience: Audience, id: string): SurveyQuestion {
  const found = questionsFor(audience).find((q) => q.id === id);
  if (!found) throw new Error(`unknown question ${id}`);
  return found;
}

export function choiceDistribution(rows: SurveyResponseRow[], audience: Audience, id: string): Distribution {
  const q = question(audience, id);
  if (q.kind !== "choice") throw new Error(`${id} is not a choice question`);
  const options =
    id === "p_q2_attainment" ? [...q.options, { value: "not_applicable", label: "Not applicable (no objective)" }] : q.options;
  return distributionOf(rows.map((row) => row.answers[id]), options, rows.length);
}

export function roleDistribution(rows: SurveyResponseRow[]): Distribution {
  return distributionOf(rows.map((row) => row.role), ATTENDEE_ROLES, rows.length);
}

export interface GridRowResult {
  rowId: string;
  label: string;
  distribution: Distribution;
  /** Top-two-box (e.g. Very + Extremely) among scored answers. */
  topTwo: { count: number; of: number; percent: number | null };
}

export function gridDistributions(rows: SurveyResponseRow[], audience: Audience, id: string): GridRowResult[] {
  const q = question(audience, id);
  if (q.kind !== "grid") throw new Error(`${id} is not a grid question`);
  const scoredOptions = q.options.filter((option) => !NON_SCORED.has(option.value));
  const topValues = new Set(scoredOptions.slice(-2).map((option) => option.value));
  return q.rows.map((row) => {
    const values = rows.map((response) => {
      const grid = response.answers[id];
      return grid && typeof grid === "object" ? (grid as Record<string, unknown>)[row.id] : undefined;
    });
    const distribution = distributionOf(values, q.options, rows.length);
    const top = distribution.bars.filter((bar) => topValues.has(bar.value)).reduce((sum, bar) => sum + bar.count, 0);
    return {
      rowId: row.id,
      label: row.label,
      distribution,
      topTwo: { count: top, of: distribution.scored, percent: pct(top, distribution.scored) },
    };
  });
}

function median(numbers: number[]): number | null {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface NumericSummary {
  responses: number;
  numeric: number;
  unanswered: number;
  /** Counts for each non-numeric answer, e.g. "Not tracked". */
  other: { value: string; label: string; count: number }[];
  median: number | null;
  total: number;
  /** For 0-10 scales: count at each point. */
  points?: { point: number; count: number }[];
}

export function numericSummary(rows: SurveyResponseRow[], audience: Audience, id: string): NumericSummary {
  const q = question(audience, id);
  if (q.kind !== "scale" && q.kind !== "count") throw new Error(`${id} is not numeric`);
  const numbers: number[] = [];
  const other = new Map<string, number>();
  let unanswered = 0;
  for (const row of rows) {
    const value = row.answers[id];
    if (typeof value === "number") numbers.push(value);
    else if (typeof value === "string") other.set(value, (other.get(value) ?? 0) + 1);
    else unanswered++;
  }
  const summary: NumericSummary = {
    responses: rows.length,
    numeric: numbers.length,
    unanswered,
    other: q.extras.map((extra) => ({ value: extra.value, label: extra.label, count: other.get(extra.value) ?? 0 })),
    median: median(numbers),
    total: numbers.reduce((sum, n) => sum + n, 0),
  };
  if (q.kind === "scale") {
    summary.points = Array.from({ length: q.max - q.min + 1 }, (_, i) => {
      const point = q.min + i;
      return { point, count: numbers.filter((n) => n === point).length };
    });
  }
  return summary;
}

/** Partner Q4 → Q5, counted only where both were given as numbers. */
export function partnerPipeline(rows: SurveyResponseRow[]) {
  let both = 0;
  let conversations = 0;
  let nextSteps = 0;
  for (const row of rows) {
    const q4 = row.answers.p_q4_qualified_conversations;
    const q5 = row.answers.p_q5_next_steps;
    if (typeof q4 === "number" && typeof q5 === "number") {
      both++;
      conversations += q4;
      nextSteps += q5;
    }
  }
  return { companiesWithBoth: both, conversations, nextSteps };
}

export interface FreeTextEntry {
  text: string;
  /** Attendee entries never carry a name here; partners carry their company. */
  source: string;
}

export function freeTextEntries(rows: SurveyResponseRow[], key: string): FreeTextEntry[] {
  return rows
    .filter((row) => typeof row.freeText[key] === "string" && row.freeText[key].trim())
    .map((row) => ({
      text: row.freeText[key],
      source:
        row.audience === "partner"
          ? row.contact?.company ?? "Partner"
          : ATTENDEE_ROLES.find((option) => option.value === row.role)?.label ?? "Attendee",
    }));
}

const normalizeCompany = (company: string | null | undefined) => (company ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export function companyCount(rows: SurveyResponseRow[]): { companies: number; duplicates: string[] } {
  const seen = new Map<string, { name: string; count: number }>();
  for (const row of rows) {
    const key = normalizeCompany(row.contact?.company);
    if (!key) continue;
    const entry = seen.get(key) ?? { name: row.contact?.company ?? key, count: 0 };
    entry.count++;
    seen.set(key, entry);
  }
  return {
    companies: seen.size,
    duplicates: [...seen.values()].filter((entry) => entry.count > 1).map((entry) => entry.name),
  };
}

/**
 * One response per partner company: the latest received. The brief asks for
 * one consolidated response per company, so repeats must not double-count
 * conversations or skew the bars. Rows without a company are kept as-is.
 */
export function latestPerCompany(rows: SurveyResponseRow[]): { rows: SurveyResponseRow[]; excluded: number } {
  const latest = new Map<string, SurveyResponseRow>();
  const kept: SurveyResponseRow[] = [];
  for (const row of rows) {
    const key = normalizeCompany(row.contact?.company);
    if (!key) {
      kept.push(row);
      continue;
    }
    const current = latest.get(key);
    if (!current || (row.contact?.receivedAt ?? "") > (current.contact?.receivedAt ?? "")) latest.set(key, row);
  }
  const deduped = [...kept, ...latest.values()];
  return { rows: deduped, excluded: rows.length - deduped.length };
}

export interface FollowUpFlag {
  responseId: string;
  company: string;
  fullName: string;
  email: string;
  reasons: string[];
}

export function partnerFollowUps(rows: SurveyResponseRow[]): FollowUpFlag[] {
  const flags: FollowUpFlag[] = [];
  for (const row of rows) {
    const reasons: string[] = [];
    const package_ = row.answers.p_q7_package;
    if (package_ === "some_missing" || package_ === "none_delivered") reasons.push("Package benefits missing");
    const attainment = row.answers.p_q2_attainment;
    if (attainment === "not_at_all" || attainment === "a_little") reasons.push("Objective not met");
    const renewal = row.answers.p_q9_renewal;
    if (renewal === "very_unlikely" || renewal === "somewhat_unlikely") reasons.push("Unlikely to partner again");
    if (row.freeText.p_q10_limited_value) reasons.push("Described a limitation");
    if (reasons.length) {
      flags.push({
        responseId: row.id,
        company: row.contact?.company ?? "Unknown company",
        fullName: row.contact?.fullName ?? "",
        email: row.contact?.email ?? "",
        reasons,
      });
    }
  }
  return flags;
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/** Quotes a cell and defuses spreadsheet formulas typed into a public form. */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function answerLabel(q: SurveyQuestion, value: unknown): string {
  if (value === undefined || value === null) return "";
  if (q.kind === "choice") return q.options.find((o) => o.value === value)?.label ?? String(value);
  if (q.kind === "scale" || q.kind === "count") {
    return typeof value === "number" ? String(value) : q.extras.find((o) => o.value === value)?.label ?? String(value);
  }
  return String(value);
}

/**
 * One row per response. `includeContact: false` produces the shareable file:
 * no names, emails or job titles. Partner company names stay, because the
 * partner report is about companies.
 */
export function toCsv(rows: SurveyResponseRow[], audience: Audience, includeContact: boolean): string {
  const questions = questionsFor(audience);
  const header: string[] = ["response_id", "submitted_hour_utc"];
  if (audience === "attendee") header.push("role", "anonymity");
  if (includeContact) {
    header.push("full_name", "email", audience === "partner" ? "company" : "agency");
    if (audience === "partner") header.push("job_title");
    else header.push("may_contact");
  } else if (audience === "partner") {
    header.push("company");
  }
  for (const q of questions) {
    if (q.kind === "grid") for (const row of q.rows) header.push(`${q.id}.${row.id}`);
    else header.push(q.id);
    if (q.kind === "choice" && q.options.some((o) => o.specify)) header.push(`${q.id}_other`);
  }

  const lines = [header.map(csvCell).join(",")];
  for (const row of rows) {
    const cells: unknown[] = [row.id, row.submittedAt];
    if (audience === "attendee") {
      cells.push(ATTENDEE_ROLES.find((o) => o.value === row.role)?.label ?? "", row.anonymity);
    }
    if (includeContact) {
      cells.push(row.contact?.fullName ?? "", row.contact?.email ?? "", row.contact?.company ?? "");
      if (audience === "partner") cells.push(row.contact?.title ?? "");
      else cells.push(row.contact ? (row.contact.contactPermission ? "yes" : "no") : "");
    } else if (audience === "partner") {
      cells.push(row.contact?.company ?? "");
    }
    for (const q of questions) {
      if (q.kind === "grid") {
        const grid = (row.answers[q.id] ?? {}) as Record<string, unknown>;
        for (const r of q.rows) cells.push(q.options.find((o) => o.value === grid[r.id])?.label ?? "");
      } else if (q.kind === "text") {
        cells.push(row.freeText[q.id] ?? "");
      } else if (q.id === "p_q2_attainment" && row.answers[q.id] === "not_applicable") {
        cells.push("Not applicable (no objective)");
      } else {
        cells.push(answerLabel(q, row.answers[q.id]));
      }
      if (q.kind === "choice" && q.options.some((o) => o.specify)) cells.push(row.freeText[`${q.id}_other`] ?? "");
    }
    lines.push(cells.map(csvCell).join(","));
  }
  return `${lines.join("\r\n")}\r\n`;
}
