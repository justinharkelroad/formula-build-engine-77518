import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Download, RefreshCw } from "lucide-react";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { QUALIFIED_CONVERSATION_DEFINITION, type Audience } from "@/lib/formulaSurvey";
import {
  byAudience,
  choiceDistribution,
  companyCount,
  freeTextEntries,
  gridDistributions,
  latestPerCompany,
  numericSummary,
  partnerFollowUps,
  partnerPipeline,
  roleDistribution,
  multiDistribution,
  testimonialsCsv,
  toCsv,
  type Distribution,
  type FreeTextEntry,
  type GridRowResult,
  type NumericSummary,
  type SurveyResponseRow,
  type TestimonialRow,
} from "@/lib/surveyResults";

/**
 * Formula 2026 survey results. Readable only by Justin, Mary and Gregg:
 * formula-survey-results checks the admin role and the reviewer list on every
 * load, so this page shows nothing to any other account even by direct URL.
 * CSV files are built in the browser from data this reviewer already received.
 */

type LoadState =
  | { kind: "loading" }
  | { kind: "denied" }
  | { kind: "signed-out" }
  | { kind: "error" }
  | { kind: "ready"; responses: SurveyResponseRow[]; testimonials: TestimonialRow[]; generatedAt: string };

type Tab = Audience | "testimonials";

const accent = "text-[#c45120]";
const card = "border border-black/15 bg-[#faf8f2] p-5 sm:p-6";

async function loadResults(): Promise<LoadState> {
  const { data, error } = await supabase.functions.invoke("formula-survey-results", { body: {} });
  if (error) {
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response && context.status === 403) return { kind: "denied" };
    if (context instanceof Response && context.status === 401) return { kind: "signed-out" };
    return { kind: "error" };
  }
  const payload = data as { responses?: SurveyResponseRow[]; testimonials?: TestimonialRow[]; generatedAt?: string } | null;
  if (!payload || !Array.isArray(payload.responses)) return { kind: "error" };
  return {
    kind: "ready",
    responses: payload.responses,
    testimonials: Array.isArray(payload.testimonials) ? payload.testimonials : [],
    generatedAt: payload.generatedAt ?? new Date().toISOString(),
  };
}

function download(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const AdminSurveyResults = () => {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [tab, setTab] = useState<Tab>("attendee");

  const refresh = useCallback(async () => {
    setState({ kind: "loading" });
    setState(await loadResults());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const attendees = useMemo(() => (state.kind === "ready" ? byAudience(state.responses, "attendee") : []), [state]);
  const partners = useMemo(() => (state.kind === "ready" ? byAudience(state.responses, "partner") : []), [state]);

  const testimonials = state.kind === "ready" ? state.testimonials : [];

  const exportCsv = (target: Tab, includeContact: boolean) => {
    const date = new Date().toISOString().slice(0, 10);
    if (target === "testimonials") {
      download(`formula-2026-testimonials-${includeContact ? "full" : "shareable"}-${date}.csv`, testimonialsCsv(testimonials, includeContact));
      return;
    }
    const audience = target;
    const rows = audience === "attendee" ? attendees : partners;
    download(
      `formula-2026-${audience}-survey-${includeContact ? "full" : "shareable"}-${date}.csv`,
      toCsv(rows, audience, includeContact),
    );
  };

  return (
    <>
      <SEO title="Survey Results | Formula Admin" description="Administrative access." path="/admin/survey-results" noindex />
      <Navigation />
      <main className="min-h-screen bg-[#f3f0e9] pt-24 text-[#181816]">
        <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-7 lg:px-10">
          <header className="border-b border-black/15 pb-8 pt-8 lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-4xl">
              <Link to="/admin/sales" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-black/60 transition hover:text-black">
                <ChevronLeft className="h-4 w-4" /> Sales dashboard
              </Link>
              <p className={`mb-3 text-xs font-bold uppercase tracking-[0.22em] ${accent}`}>Formula 2026 · Post-event surveys</p>
              <h1 className="text-4xl font-bold tracking-[-0.045em] sm:text-6xl">What Formula delivered.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-black/60">
                Every figure shows its count and denominator. Unanswered, unsure, not applicable and did-not-attend answers
                are counted but never scored.
              </p>
            </div>
            <Button variant="outline" className="mt-7 border-black/20 bg-transparent lg:mt-0" onClick={() => void refresh()} disabled={state.kind === "loading"}>
              <RefreshCw className={`mr-2 h-4 w-4 ${state.kind === "loading" ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </header>

          {state.kind === "loading" && (
            <div className="mt-10 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}
          {state.kind === "denied" && (
            <div role="alert" className="mt-10 border border-black/15 bg-[#faf8f2] p-6">
              <p className="text-lg font-bold">This account can't read survey results.</p>
              <p className="mt-2 text-sm text-black/60">
                Results are limited to the Formula feedback reviewers. Ask Justin to add your sign-in email to the reviewer list.
              </p>
            </div>
          )}
          {state.kind === "signed-out" && (
            <div role="alert" className="mt-10 border border-black/15 bg-[#faf8f2] p-6">
              <p className="text-lg font-bold">Your session has expired.</p>
              <p className="mt-2 text-sm text-black/60">
                <Link to="/admin/auth" className="underline">Sign in again</Link> to load the results.
              </p>
            </div>
          )}
          {state.kind === "error" && (
            <div role="alert" className="mt-10 flex flex-col gap-4 border border-red-300 bg-red-50 p-5 text-red-900 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">Survey results could not load.</p>
              <Button variant="outline" className="border-red-300 bg-transparent text-red-900 hover:bg-red-100" onClick={() => void refresh()}>
                Retry
              </Button>
            </div>
          )}

          {state.kind === "ready" && (
            <>
              <section aria-label="Response counts" className="mt-8 grid gap-px border-y border-black/15 bg-black/15 sm:grid-cols-2 lg:grid-cols-4">
                <Stat value={String(attendees.length)} label="Attendee responses" />
                <Stat
                  value={`${attendees.filter((row) => row.anonymity === "identified").length} of ${attendees.length}`}
                  label="Attendees who gave their name"
                />
                <Stat
                  value={String(companyCount(partners).companies)}
                  label={`Partner companies (${responsesLabel(partners.length)})`}
                />
                <Stat
                  value={`${testimonials.filter((t) => t.publishConsent).length} of ${testimonials.length}`}
                  label="Testimonials cleared to share publicly"
                />
              </section>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                <div role="group" aria-label="Survey" className="inline-flex border border-black/20">
                  {(["attendee", "partner", "testimonials"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={tab === option}
                      onClick={() => setTab(option)}
                      className={`px-4 py-2.5 text-sm font-bold sm:px-5 ${tab === option ? "bg-black text-white" : "text-black/70 hover:text-black"}`}
                    >
                      {option === "attendee" ? "Attendees" : option === "partner" ? "Partners" : "Testimonials"}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="border-black/20 bg-transparent" onClick={() => exportCsv(tab, true)}>
                    <Download className="mr-2 h-4 w-4" /> Full CSV
                  </Button>
                  <Button variant="outline" className="border-black/20 bg-transparent" onClick={() => exportCsv(tab, false)}>
                    <Download className="mr-2 h-4 w-4" />{" "}
                    {tab === "testimonials" ? "Shareable CSV (no emails)" : "Shareable CSV (no names or emails)"}
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-xs text-black/50">
                Data as of {new Date(state.generatedAt).toLocaleString()}. Submission times are stored to the hour only.
              </p>

              {tab === "attendee" && <AttendeeResults rows={attendees} />}
              {tab === "partner" && <PartnerResults rows={partners} />}
              {tab === "testimonials" && <TestimonialResults rows={testimonials} />}
            </>
          )}
        </section>
      </main>
    </>
  );
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#f3f0e9] px-5 py-5">
      <div className="font-mono text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">{label}</div>
    </div>
  );
}

function Block({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className={card}>
      <h3 className="text-lg font-bold leading-snug">{title}</h3>
      {note && <p className="mt-1 text-xs leading-5 text-black/55">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const responsesLabel = (n: number) => `${n} ${n === 1 ? "response" : "responses"}`;

function Denominator({ d }: { d: Distribution }) {
  return (
    <p className="mb-3 text-xs font-semibold text-black/55">
      {d.scored} rated of {responsesLabel(d.responses)} · {d.answered - d.scored} other answers · {d.unanswered} unanswered
    </p>
  );
}

function Bars({ d }: { d: Distribution }) {
  const max = Math.max(1, ...d.bars.map((bar) => bar.count));
  return (
    <div>
      <Denominator d={d} />
      <ul className="space-y-1.5">
        {d.bars.map((bar) => (
          <li key={bar.value} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
            <div className="min-w-0">
              <div className={bar.scored ? "text-black" : "text-black/55"}>
                {bar.label}
              </div>
              <div className="mt-0.5 h-2 bg-black/[0.06]">
                <div
                  className={bar.scored ? "h-full bg-[#181816]" : "h-full bg-black/25"}
                  style={{ width: `${(bar.count / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-24 text-right font-mono tabular-nums">
              {bar.count}
              <span className="ml-1 text-black/45">{bar.percent === null ? "" : `· ${bar.percent}%`}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GridTable({ rows, topLabel }: { rows: GridRowResult[]; topLabel: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-black/15 text-left text-xs uppercase tracking-wide text-black/50">
            <th className="py-2 pr-3 font-semibold">Item</th>
            <th className="py-2 pr-3 text-right font-semibold">{topLabel}</th>
            <th className="py-2 pr-3 text-right font-semibold">Rated</th>
            <th className="py-2 pr-3 text-right font-semibold">Other answers</th>
            <th className="py-2 text-right font-semibold">Unanswered</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rowId} className="border-b border-black/10 align-top">
              <td className="py-2 pr-3">
                <div className="font-semibold">{row.label}</div>
                <div className="mt-1 text-xs text-black/55">
                  {row.distribution.bars.filter((bar) => bar.count > 0).map((bar) => `${bar.label} ${bar.count}`).join(" · ") || "No answers yet"}
                </div>
              </td>
              <td className="py-2 pr-3 text-right font-mono tabular-nums">
                {row.topTwo.count} of {row.topTwo.of}
                {row.topTwo.percent !== null && <span className="block text-black/45">{row.topTwo.percent}%</span>}
              </td>
              <td className="py-2 pr-3 text-right font-mono tabular-nums">{row.distribution.scored}</td>
              <td className="py-2 pr-3 text-right font-mono tabular-nums">{row.distribution.answered - row.distribution.scored}</td>
              <td className="py-2 text-right font-mono tabular-nums">{row.distribution.unanswered}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Numeric({ s, unit }: { s: NumericSummary; unit: string }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs font-semibold text-black/55">
        {s.numeric} gave a number of {responsesLabel(s.responses)} · {s.unanswered} unanswered
      </p>
      {s.points && (
        <div className="grid grid-cols-11 gap-1 text-center">
          {s.points.map((point) => (
            <div key={point.point}>
              <div className="font-mono tabular-nums">{point.count}</div>
              <div className="text-[11px] text-black/45">{point.point}</div>
            </div>
          ))}
        </div>
      )}
      <p>
        Median: <span className="font-mono">{s.median ?? "—"}</span>
        {!s.points && (
          <>
            {" "}· Total {unit}: <span className="font-mono">{s.total}</span>
          </>
        )}
      </p>
      <ul className="text-black/65">
        {s.other.map((other) => (
          <li key={other.value}>
            {other.label}: <span className="font-mono">{other.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TextList({ entries, responses }: { entries: FreeTextEntry[]; responses: number }) {
  if (!entries.length) return <p className="text-sm text-black/50">No written answers yet (0 of {responsesLabel(responses)}).</p>;
  return (
    <div>
      <p className="mb-3 text-xs font-semibold text-black/55">
        {entries.length} of {responsesLabel(responses)} wrote an answer
      </p>
      <ul className="max-h-[480px] space-y-3 overflow-y-auto pr-2">
        {entries.map((entry, index) => (
          <li key={index} className="border-l-2 border-black/15 pl-3 text-sm leading-6">
            <p className="whitespace-pre-wrap">{entry.text}</p>
            <p className="mt-1 text-xs text-black/45">{entry.source}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AttendeeResults({ rows }: { rows: SurveyResponseRow[] }) {
  if (!rows.length) return <p className="mt-8 text-black/60">No attendee responses yet.</p>;
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <Block title="Role">
        <Bars d={roleDistribution(rows)} />
      </Block>
      <Block title="1. Overall value of attending">
        <Bars d={choiceDistribution(rows, "attendee", "a_q1_value")} />
      </Block>
      <Block title="2. The 2027 plan they left with">
        <Bars d={choiceDistribution(rows, "attendee", "a_q2_plan")} />
      </Block>
      <Block title="3. Alignment with colleagues who attended">
        <Bars d={choiceDistribution(rows, "attendee", "a_q3_alignment")} />
      </Block>
      <div className="lg:col-span-2">
        <Block
          title="4. Session usefulness"
          note="Rated = attended and gave a usefulness rating. Did not attend and Unable to assess are excluded from the denominator."
        >
          <GridTable rows={gridDistributions(rows, "attendee", "a_q4_sessions")} topLabel="Very + Extremely useful" />
        </Block>
      </div>
      <Block title="5. Value of connections">
        <Bars d={choiceDistribution(rows, "attendee", "a_q5_connections")} />
      </Block>
      <Block title="6a. Programming pace">
        <Bars d={choiceDistribution(rows, "attendee", "a_q6a_pace")} />
      </Block>
      <Block title="6b. Time for workbook work">
        <Bars d={choiceDistribution(rows, "attendee", "a_q6b_workbook_time")} />
      </Block>
      <Block title="6d. Destiny Rescue experience">
        <Bars d={choiceDistribution(rows, "attendee", "a_q6d_destiny_rescue")} />
      </Block>
      <div className="lg:col-span-2">
        <Block title="6c. Event experience" note="Each item rated separately. No composite score.">
          <GridTable rows={gridDistributions(rows, "attendee", "a_q6c_event")} topLabel="Very good + Excellent" />
        </Block>
      </div>
      <Block title="7. Saving plans with the Formula app">
        <Bars d={choiceDistribution(rows, "attendee", "a_q7_app")} />
      </Block>
      <Block title="10. Likelihood of attending in 2027" note="Reported as a distribution. Not an NPS.">
        <Numeric s={numericSummary(rows, "attendee", "a_q10_attend_2027")} unit="" />
      </Block>
      <div className="lg:col-span-2">
        <DateBlock rows={rows} audience="attendee" />
      </div>
      <Block title="8. One action already taken" note="Shown without names, with the respondent's role only.">
        <TextList entries={freeTextEntries(rows, "a_q8_action")} responses={rows.length} />
      </Block>
      <Block title="9. What most reduced the value" note="Shown without names, with the respondent's role only.">
        <TextList entries={freeTextEntries(rows, "a_q9_reduced_value")} responses={rows.length} />
      </Block>
    </div>
  );
}

function PartnerResults({ rows: allRows }: { rows: SurveyResponseRow[] }) {
  if (!allRows.length) return <p className="mt-8 text-black/60">No partner responses yet.</p>;
  const companies = companyCount(allRows);
  // Figures use one response per company (the latest); CSV keeps every response.
  const { rows, excluded } = latestPerCompany(allRows);
  const pipeline = partnerPipeline(rows);
  const flags = partnerFollowUps(rows);
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      {companies.duplicates.length > 0 && (
        <div className="lg:col-span-2">
          <p role="status" className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            More than one response from: {companies.duplicates.join(", ")}. The figures below use each company's latest
            response ({excluded} earlier {excluded === 1 ? "response is" : "responses are"} left out). The CSV files keep every
            response.
          </p>
        </div>
      )}
      <Block title="1. Primary reason for partnering">
        <Bars d={choiceDistribution(rows, "partner", "p_q1_objective")} />
      </Block>
      <Block title="2. Objective met">
        <Bars d={choiceDistribution(rows, "partner", "p_q2_attainment")} />
      </Block>
      <Block title="3. Fit with target customers">
        <Bars d={choiceDistribution(rows, "partner", "p_q3_fit")} />
      </Block>
      <Block title="6. Time to connect with attendees">
        <Bars d={choiceDistribution(rows, "partner", "p_q6_connect_time")} />
      </Block>
      <Block title="4. Agencies with a qualified conversation" note={QUALIFIED_CONVERSATION_DEFINITION}>
        <Numeric s={numericSummary(rows, "partner", "p_q4_qualified_conversations")} unit="agencies" />
      </Block>
      <Block title="5. Agencies that agreed to a next step" note="A next step is not a sale.">
        <Numeric s={numericSummary(rows, "partner", "p_q5_next_steps")} unit="agencies" />
        <p className="mt-3 border-t border-black/10 pt-3 text-sm">
          Where a company gave both numbers ({pipeline.companiesWithBoth} companies): {pipeline.nextSteps} next steps from{" "}
          {pipeline.conversations} qualified conversations.
        </p>
      </Block>
      <Block title="7. Package benefits delivered">
        <Bars d={choiceDistribution(rows, "partner", "p_q7_package")} />
      </Block>
      <Block title="9. Likelihood of partnering again">
        <Bars d={choiceDistribution(rows, "partner", "p_q9_renewal")} />
      </Block>
      <div className="lg:col-span-2">
        <Block
          title={`Follow-up flags: ${flags.length} of ${rows.length} companies`}
          note="Missing benefits, an unmet objective, low renewal intent, or a written limitation."
        >
          {flags.length ? (
            <ul className="divide-y divide-black/10 text-sm">
              {flags.map((flag) => (
                <li key={flag.responseId} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">{flag.company}</p>
                    <p className="text-black/60">
                      {flag.fullName} · <a className="underline" href={`mailto:${flag.email}`}>{flag.email}</a>
                    </p>
                  </div>
                  <p className="text-black/70 sm:text-right">{flag.reasons.join(" · ")}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-black/50">No partner needs follow-up yet.</p>
          )}
        </Block>
      </div>
      <div className="lg:col-span-2">
        <DateBlock rows={rows} audience="partner" />
      </div>
      <Block title="8. What created the most value">
        <TextList entries={freeTextEntries(rows, "p_q8_most_value")} responses={rows.length} />
      </Block>
      <Block title="10. What most limited the value">
        <TextList entries={freeTextEntries(rows, "p_q10_limited_value")} responses={rows.length} />
      </Block>
    </div>
  );
}

export default AdminSurveyResults;

function DateBlock({ rows, audience }: { rows: SurveyResponseRow[]; audience: Audience }) {
  const prefix = audience === "attendee" ? "a" : "p";
  const d = multiDistribution(rows, audience, `${prefix}_q11_dates_2027`);
  const notes = freeTextEntries(rows, `${prefix}_q11_dates_note`);
  const max = Math.max(1, ...d.bars.map((bar) => bar.count));
  return (
    <Block
      title="11. Formula 2027 timing"
      note="People could pick up to two windows, so the percentages add up to more than 100%."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-semibold text-black/55">
            {d.answered} of {responsesLabel(d.responses)} answered · {d.unanswered} unanswered
          </p>
          <ul className="space-y-1.5">
            {d.bars.map((bar) => (
              <li key={bar.value} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <div className="min-w-0">
                  <div>{bar.label}</div>
                  <div className="mt-0.5 h-2 bg-black/[0.06]">
                    <div className="h-full bg-[#181816]" style={{ width: `${(bar.count / max) * 100}%` }} />
                  </div>
                </div>
                <div className="w-24 text-right font-mono tabular-nums">
                  {bar.count}
                  <span className="ml-1 text-black/45">{bar.percent === null ? "" : `· ${bar.percent}%`}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Specific dates or conflicts</p>
          <TextList entries={notes} responses={rows.length} />
        </div>
      </div>
    </Block>
  );
}

function TestimonialResults({ rows }: { rows: TestimonialRow[] }) {
  if (!rows.length) return <p className="mt-8 text-black/60">No testimonials yet.</p>;
  const shareable = rows.filter((row) => row.publishConsent).length;
  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-black/60">
        {rows.length} {rows.length === 1 ? "testimonial" : "testimonials"}: {shareable} cleared to share publicly with the
        person's name, {rows.length - shareable} internal only. Testimonials are stored apart from survey answers and are
        not linked to them.
      </p>
      <ul className="grid gap-4 lg:grid-cols-2">
        {rows.map((row) => (
          <li key={row.id} className={card}>
            <p
              className={`mb-3 inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                row.publishConsent ? "bg-emerald-100 text-emerald-900" : "bg-black/10 text-black/70"
              }`}
            >
              {row.publishConsent ? "May share publicly" : "Internal only"}
            </p>
            <blockquote className="whitespace-pre-wrap text-[15px] leading-7">{row.body}</blockquote>
            <p className="mt-4 text-sm font-semibold">{row.fullName}</p>
            <p className="text-sm text-black/60">
              {[row.title, row.company, row.audience === "partner" ? "Partner" : "Attendee"].filter(Boolean).join(" · ")}
            </p>
            {row.email && (
              <a className="text-sm underline" href={`mailto:${row.email}`}>
                {row.email}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
