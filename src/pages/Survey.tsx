import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { SurveyQuestionField, describeAnswer, type Answers } from "@/components/survey/SurveyQuestion";
import {
  ATTENDEE_Q6_HEADING,
  ATTENDEE_ROLES,
  SURVEY_COPY,
  SURVEY_ERROR_MESSAGES,
  TESTIMONIAL_COPY,
  TESTIMONIAL_MAX,
  isValidEmail,
  stepsFor,
  submitSurvey,
  type AnonymityMode,
  type AnswerValue,
  type Audience,
} from "@/lib/formulaSurvey";
import { pauseTracking } from "@/lib/surveyTracking";

/**
 * Formula 2026 post-event surveys.
 *
 * /survey            landing: attendee or partner
 * /survey/attendee   anonymous by default; identity only if the person opts in
 * /survey/partner    always identified, one consolidated response per company
 *
 * Every feedback question is optional and an unanswered question is sent as
 * absent, never as 0. Answers live only in this page's memory: nothing goes to
 * localStorage, and a random submission key (also memory-only) makes a retry
 * land once. No tracker runs here (index.html, useAnalytics, pauseTracking).
 */

const shell = "min-h-screen bg-black text-white";
const panel = "rounded-2xl bg-[hsl(0,0%,96%)] p-5 text-black sm:p-8 md:rounded-3xl md:p-10";
const eyebrow = "text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--secondary))]";
const field =
  "mt-1 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black focus:ring-2 focus:ring-[hsl(var(--secondary))]";
const primaryButton =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-black px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--secondary))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";
const secondaryButton =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-black/20 px-6 py-3 font-bold text-black transition hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--secondary))]";
const choiceCard =
  "group flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-black/15 bg-white px-4 py-3 text-[15px] text-black has-[:checked]:border-black has-[:checked]:ring-1 has-[:checked]:ring-black has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[hsl(var(--secondary))]";

interface ContactDraft {
  fullName: string;
  email: string;
  company: string;
  title: string;
  contactPermission: boolean;
}

const EMPTY_CONTACT: ContactDraft = { fullName: "", email: "", company: "", title: "", contactPermission: false };

function newSubmissionKey(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const SEO_PROPS = {
  attendee: { title: "Attendee Feedback | Formula 2026", path: "/survey/attendee" },
  partner: { title: "Partner Feedback | Formula 2026", path: "/survey/partner" },
} as const;

const Survey = () => {
  const { audience: param } = useParams();

  useEffect(() => pauseTracking(), []);

  if (param !== undefined && param !== "attendee" && param !== "partner") {
    return <Navigate to="/survey" replace />;
  }
  const audience = param as Audience | undefined;

  return (
    <div className={shell}>
      <SEO
        title={audience ? SEO_PROPS[audience].title : "Formula 2026 Feedback"}
        description={SURVEY_COPY.description}
        path={audience ? SEO_PROPS[audience].path : "/survey"}
        noindex
      />
      <header className="border-b border-white/10 px-4 py-4 md:px-12">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link to="/survey" className="text-sm font-black tracking-[0.2em]">
            FORMULA <span className="text-white/45">· 2026 FEEDBACK</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 md:py-14">
        {audience ? <SurveyFlow key={audience} audience={audience} /> : <Landing />}
      </main>
      <footer className="px-4 pb-10 text-center text-xs text-white/40">
        Questions about this survey? <a className="underline" href="mailto:info@theformulaforum.com">info@theformulaforum.com</a>
      </footer>
    </div>
  );
};

function Landing() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-black leading-tight md:text-5xl">{SURVEY_COPY.title}</h1>
        <p className="text-lg leading-relaxed text-white/80 md:text-xl">{SURVEY_COPY.description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/survey/attendee"
          className="group flex min-h-[120px] flex-col justify-between rounded-2xl bg-[hsl(0,0%,96%)] p-6 text-black transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--secondary))]"
        >
          <span className="text-xl font-black">{SURVEY_COPY.attendeeChoice}</span>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-black/60">
            Anonymous unless you choose otherwise <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
        <Link
          to="/survey/partner"
          className="group flex min-h-[120px] flex-col justify-between rounded-2xl bg-[hsl(0,0%,96%)] p-6 text-black transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--secondary))]"
        >
          <span className="text-xl font-black">{SURVEY_COPY.partnerChoice}</span>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-black/60">
            One response per company <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
      <p className="text-sm leading-relaxed text-white/55">
        Every feedback question is optional. Responses are read only by the Formula feedback reviewers and are never
        published. This page runs no advertising or analytics trackers.
      </p>
    </div>
  );
}

/**
 * `retryOnly`: the save may or may not have landed (lost connection, server
 * error), so the next attempt must resend the identical payload. Allowing
 * edits there would let a "duplicate" reply silently discard the changes.
 */
type SubmitState =
  | { kind: "editing" }
  | { kind: "submitting" }
  | { kind: "failed"; message: string; retryOnly: boolean }
  | { kind: "saved" };

/** Focus after React has rendered the element (e.g. a just-shown error). */
function focusSoon(id: string) {
  window.setTimeout(() => document.getElementById(id)?.focus(), 0);
}

function SurveyFlow({ audience }: { audience: Audience }) {
  const steps = stepsFor(audience);
  const reviewIndex = steps.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [role, setRole] = useState<string | null>(null);
  const [anonymity, setAnonymity] = useState<AnonymityMode>(audience === "partner" ? "identified" : "anonymous");
  const [contact, setContact] = useState<ContactDraft>(EMPTY_CONTACT);
  const [identityErrors, setIdentityErrors] = useState<Record<string, string>>({});
  const [countError, setCountError] = useState<string | null>(null);
  const [submit, setSubmit] = useState<SubmitState>({ kind: "editing" });
  const [testimonialPrefill, setTestimonialPrefill] = useState<ContactDraft | null>(null);
  // One key per survey attempt, kept only in memory. Retries reuse it.
  const [submissionKey] = useState(newSubmissionKey);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The exact payload of an attempt whose outcome is unknown; retries resend it.
  const pendingPayload = useRef<Record<string, unknown> | null>(null);
  const firstRender = useRef(true);
  const saved = submit.kind === "saved";

  // Move focus to the new heading on every step change so screen readers
  // announce it, but not on first load (the page heading is enough there).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [stepIndex, saved]);

  const setAnswer = (id: string, value: AnswerValue | undefined) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined) delete next[id];
      else next[id] = value;
      return next;
    });
    if (id.startsWith("p_q4") || id.startsWith("p_q5")) setCountError(null);
  };

  const chooseAnonymity = (mode: AnonymityMode) => {
    setAnonymity(mode);
    if (mode === "anonymous") {
      // Going back to anonymous throws away anything typed, so it cannot be sent.
      setContact(EMPTY_CONTACT);
      setIdentityErrors({});
    }
  };

  const identified = anonymity === "identified";

  const validateIdentity = (): boolean => {
    if (!identified) return true;
    const errors: Record<string, string> = {};
    if (!contact.fullName.trim()) errors.fullName = SURVEY_ERROR_MESSAGES.name_required;
    if (!isValidEmail(contact.email.trim())) errors.email = SURVEY_ERROR_MESSAGES.valid_email_required;
    if (audience === "partner" && !contact.company.trim()) errors.company = SURVEY_ERROR_MESSAGES.company_required;
    setIdentityErrors(errors);
    const first = (["company", "fullName", "email"] as const).find((field) => errors[field]);
    if (first) focusSoon(`${audience}-${first === "fullName" ? "name" : first}`);
    return Object.keys(errors).length === 0;
  };

  const validateCounts = (): boolean => {
    const q4 = answers.p_q4_qualified_conversations;
    const q5 = answers.p_q5_next_steps;
    if (typeof q4 === "number" && typeof q5 === "number" && q5 > q4) {
      setCountError(SURVEY_ERROR_MESSAGES.next_steps_exceed_conversations);
      focusSoon("p_q5_next_steps-number");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (stepIndex === 0 && !validateIdentity()) return;
    if (!validateCounts()) return;
    setStepIndex((index) => Math.min(index + 1, reviewIndex));
  };

  const payload = useMemo(() => {
    const sent: Record<string, AnswerValue> = {};
    for (const [key, value] of Object.entries(answers)) {
      if (value === undefined) continue;
      if (key === "p_q1_objective_other" && answers.p_q1_objective !== "other") continue;
      if (key === "p_q2_attainment" && answers.p_q1_objective === "no_objective") continue;
      sent[key] = value;
    }
    const body: Record<string, unknown> = { submissionKey, audience, anonymity, answers: sent };
    if (audience === "attendee") body.role = role;
    if (identified) {
      body.contact =
        audience === "partner"
          ? {
              fullName: contact.fullName.trim(),
              email: contact.email.trim(),
              company: contact.company.trim(),
              title: contact.title.trim() || null,
            }
          : {
              fullName: contact.fullName.trim(),
              email: contact.email.trim(),
              company: contact.company.trim() || null,
              contactPermission: contact.contactPermission,
            };
    }
    return body;
  }, [answers, anonymity, audience, contact, identified, role, submissionKey]);

  const send = async () => {
    let body = pendingPayload.current;
    if (!body) {
      if (!validateIdentity()) {
        setStepIndex(0);
        return;
      }
      if (!validateCounts()) return;
      body = payload;
      pendingPayload.current = body;
    }
    setSubmit({ kind: "submitting" });
    const outcome = await submitSurvey(body);
    if (outcome.kind === "saved") {
      pendingPayload.current = null;
      // Offer identified people their own details back on the testimonial
      // form. Anonymous attendees get an empty form, never their survey data.
      setTestimonialPrefill(identified ? { ...contact } : null);
      setSubmit({ kind: "saved" });
      setAnswers({});
      setContact(EMPTY_CONTACT);
      return;
    }
    // A 4xx means the server refused before saving; anything else is unknown.
    const nothingSaved = outcome.status >= 400 && outcome.status < 500;
    if (nothingSaved) pendingPayload.current = null;
    setSubmit({
      kind: "failed",
      retryOnly: !nothingSaved,
      message: nothingSaved
        ? SURVEY_ERROR_MESSAGES[outcome.code] ?? "Some answers couldn't be accepted. Please check them and try again."
        : "We couldn't confirm your answers were saved. Press Try again to resend exactly the same answers; you won't be counted twice.",
    });
  };

  const locked = submit.kind === "submitting" || (submit.kind === "failed" && submit.retryOnly);

  if (submit.kind === "saved") {
    return (
      <section className={panel} aria-live="polite">
        <Check className="h-8 w-8" aria-hidden="true" />
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-3xl font-black outline-none">
          Thank you. Your feedback was received.
        </h1>
        <p className="mt-3 leading-relaxed text-black/70">
          {audience === "partner"
            ? "The Formula team will review your company's response and follow up on any partnership issues you raised."
            : "Your answers were saved."}
        </p>
        <TestimonialForm audience={audience} anonymous={!testimonialPrefill} prefill={testimonialPrefill} />
      </section>
    );
  }

  const onReview = stepIndex === reviewIndex;
  const step = steps[stepIndex];
  const progress = Math.round(((stepIndex + (onReview ? 0 : 1)) / steps.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <p className={eyebrow}>{audience === "attendee" ? "Attendee survey" : "Partner survey"}</p>
        <div className="mt-3 flex items-center justify-between gap-4 text-sm text-white/70">
          <span>{onReview ? "Review and submit" : `Step ${stepIndex + 1} of ${steps.length}`}</span>
          <span>{onReview ? "All steps done" : step.title}</span>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15"
          role="progressbar"
          aria-label="Survey progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="h-full rounded-full bg-[hsl(var(--secondary))] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className={`${panel} space-y-10`}>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-black leading-tight outline-none md:text-3xl">
          {onReview ? "Review your answers" : step.title}
        </h1>

        {!onReview && stepIndex === 0 && (
          <div className="space-y-6">
            <p className="leading-relaxed text-black/75">
              {audience === "attendee" ? SURVEY_COPY.attendeeIntro : SURVEY_COPY.partnerIntro}
            </p>
            {audience === "attendee" ? (
              <AttendeeIdentity
                role={role}
                setRole={setRole}
                anonymity={anonymity}
                chooseAnonymity={chooseAnonymity}
                contact={contact}
                setContact={setContact}
                errors={identityErrors}
              />
            ) : (
              <PartnerIdentity contact={contact} setContact={setContact} errors={identityErrors} />
            )}
          </div>
        )}

        {!onReview &&
          step.questions.map((question) => (
            <div key={question.id} className="space-y-3">
              {question.id === "a_q6a_pace" && <h2 className="text-lg font-bold md:text-xl">{ATTENDEE_Q6_HEADING}</h2>}
              <SurveyQuestionField
                question={question}
                answers={answers}
                setAnswer={setAnswer}
                error={question.id === "p_q5_next_steps" ? countError : null}
                disabledNote={
                  question.id === "p_q2_attainment" && answers.p_q1_objective === "no_objective"
                    ? "Not applicable: you chose \"No specific objective\" in question 1."
                    : undefined
                }
              />
            </div>
          ))}

        {onReview && (
          <Review
            audience={audience}
            answers={answers}
            role={role}
            identified={identified}
            contact={contact}
            canEdit={!locked}
            onEdit={(index) => {
              setSubmit({ kind: "editing" });
              setStepIndex(index);
            }}
          />
        )}

        {submit.kind === "failed" && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {submit.message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-between">
          {locked ? (
            <span />
          ) : stepIndex > 0 ? (
            <button type="button" className={secondaryButton} onClick={() => setStepIndex((index) => index - 1)}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
          ) : (
            <Link to="/survey" className={secondaryButton}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </Link>
          )}
          {onReview ? (
            <button type="button" className={primaryButton} onClick={send} disabled={submit.kind === "submitting"}>
              {submit.kind === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…
                </>
              ) : submit.kind === "failed" ? (
                "Try again"
              ) : (
                "Submit feedback"
              )}
            </button>
          ) : (
            <button type="button" className={primaryButton} onClick={goNext}>
              {stepIndex === steps.length - 1 ? "Review answers" : "Next"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      {audience === "attendee" && (
        <p className="text-xs leading-relaxed text-white/50">{SURVEY_COPY.technicalDataNotice}</p>
      )}
    </div>
  );
}

type TestimonialState =
  | { kind: "editing"; error: string | null }
  | { kind: "submitting" }
  | { kind: "failed"; message: string }
  | { kind: "saved" };

/**
 * Optional testimonial, shown after the survey is saved. It is its own
 * submission with its own key, so nothing ties it to the survey response.
 */
function TestimonialForm({
  audience,
  anonymous,
  prefill,
}: {
  audience: Audience;
  anonymous: boolean;
  prefill: ContactDraft | null;
}) {
  const [body, setBody] = useState("");
  const [fullName, setFullName] = useState(prefill?.fullName ?? "");
  const [company, setCompany] = useState(prefill?.company ?? "");
  const [title, setTitle] = useState(prefill?.title ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [publish, setPublish] = useState<boolean | null>(null);
  const [state, setState] = useState<TestimonialState>({ kind: "editing", error: null });
  const [submissionKey] = useState(newSubmissionKey);
  // Once a send's outcome is unknown, retries resend exactly this payload.
  const pending = useRef<Record<string, unknown> | null>(null);

  if (state.kind === "saved") {
    return (
      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5" role="status">
        <p className="font-bold">{TESTIMONIAL_COPY.saved}</p>
      </div>
    );
  }

  const locked = state.kind === "submitting" || state.kind === "failed";

  const send = async () => {
    let payload = pending.current;
    if (!payload) {
      const error = !body.trim()
        ? SURVEY_ERROR_MESSAGES.testimonial_required
        : !fullName.trim()
          ? SURVEY_ERROR_MESSAGES.name_required
          : email.trim() && !isValidEmail(email.trim())
            ? SURVEY_ERROR_MESSAGES.valid_email_required
            : publish === null
              ? SURVEY_ERROR_MESSAGES.publish_choice_required
              : null;
      if (error) {
        setState({ kind: "editing", error });
        return;
      }
      payload = {
        type: "testimonial",
        submissionKey,
        audience,
        body: body.trim(),
        fullName: fullName.trim(),
        company: company.trim() || null,
        title: title.trim() || null,
        email: email.trim() || null,
        publishConsent: publish,
      };
      pending.current = payload;
    }
    setState({ kind: "submitting" });
    const outcome = await submitSurvey(payload);
    if (outcome.kind === "saved") {
      pending.current = null;
      setState({ kind: "saved" });
      return;
    }
    if (outcome.status >= 400 && outcome.status < 500) {
      pending.current = null;
      setState({
        kind: "editing",
        error: SURVEY_ERROR_MESSAGES[outcome.code] ?? "Something in the form couldn't be accepted. Please check it.",
      });
      return;
    }
    setState({
      kind: "failed",
      message: "We couldn't confirm your testimonial was saved. Press Try again to resend it; it won't be saved twice.",
    });
  };

  return (
    <div className="mt-10 space-y-5 border-t border-black/10 pt-8">
      <div>
        <h2 className="text-2xl font-black">{TESTIMONIAL_COPY.heading}</h2>
        <p className="mt-2 leading-relaxed text-black/70">
          {audience === "partner" ? TESTIMONIAL_COPY.partnerIntro : TESTIMONIAL_COPY.intro}
        </p>
        {anonymous && audience === "attendee" && (
          <p className="mt-2 text-sm text-black/60">{TESTIMONIAL_COPY.anonymousNote}</p>
        )}
      </div>
      <fieldset disabled={locked} className="space-y-4">
        <div>
          <label htmlFor="testimonial-body" className="text-sm font-semibold text-black/80">
            {TESTIMONIAL_COPY.bodyLabel}
            <span aria-hidden="true"> *</span>
          </label>
          <textarea
            id="testimonial-body"
            rows={6}
            maxLength={TESTIMONIAL_MAX}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className={field}
          />
          <p aria-hidden="true" className="mt-1 text-right text-xs text-black/50">
            {body.length}/{TESTIMONIAL_MAX}
          </p>
        </div>
        <TextInput id="testimonial-name" label="Your name" value={fullName} onChange={setFullName} autoComplete="name" required />
        <TextInput
          id="testimonial-company"
          label={audience === "partner" ? "Company" : "Agency"}
          value={company}
          onChange={setCompany}
          autoComplete="organization"
        />
        <TextInput id="testimonial-title" label="Title or role" value={title} onChange={setTitle} autoComplete="organization-title" />
        <TextInput
          id="testimonial-email"
          label="Email, in case we need to check your wording"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-black/80">
            May we share it?<span aria-hidden="true"> *</span>
          </legend>
          {[
            { value: true, label: TESTIMONIAL_COPY.publishYes },
            { value: false, label: TESTIMONIAL_COPY.publishNo },
          ].map((option) => (
            <label key={String(option.value)} className={choiceCard}>
              <input
                type="radio"
                name="testimonial-publish"
                checked={publish === option.value}
                onChange={() => setPublish(option.value)}
                className="mt-1 accent-black"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      </fieldset>
      {(state.kind === "failed" || (state.kind === "editing" && state.error)) && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {state.kind === "failed" ? state.message : state.error}
        </p>
      )}
      <button type="button" className={primaryButton} onClick={send} disabled={state.kind === "submitting"}>
        {state.kind === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : state.kind === "failed" ? (
          "Try again"
        ) : (
          "Send testimonial"
        )}
      </button>
    </div>
  );
}

function TextInput({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-black/80">
        {label}
        {required ? <span aria-hidden="true"> *</span> : <span className="font-normal text-black/50"> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={field}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function AttendeeIdentity({
  role,
  setRole,
  anonymity,
  chooseAnonymity,
  contact,
  setContact,
  errors,
}: {
  role: string | null;
  setRole: (role: string | null) => void;
  anonymity: AnonymityMode;
  chooseAnonymity: (mode: AnonymityMode) => void;
  contact: ContactDraft;
  setContact: (contact: ContactDraft) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="mb-1 text-lg font-bold">Which best describes you at Formula?</legend>
        <div className="flex flex-col gap-2">
          {ATTENDEE_ROLES.map((option) => (
            <label key={option.value} className={choiceCard}>
              <input
                type="radio"
                name="attendee-role"
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                className="mt-1 accent-black"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1 text-lg font-bold">Your name</legend>
        <p className="text-sm leading-relaxed text-black/65">{SURVEY_COPY.attendeePrivacy}</p>
        <div className="flex flex-col gap-2">
          <label className={choiceCard}>
            <input
              type="radio"
              name="anonymity"
              checked={anonymity === "anonymous"}
              onChange={() => chooseAnonymity("anonymous")}
              className="mt-1 accent-black"
            />
            <span>
              <span className="font-bold">Stay anonymous</span>
              <span className="block text-sm text-black/60">We won't ask for your name or email.</span>
            </span>
          </label>
          <label className={choiceCard}>
            <input
              type="radio"
              name="anonymity"
              checked={anonymity === "identified"}
              onChange={() => chooseAnonymity("identified")}
              className="mt-1 accent-black"
            />
            <span>
              <span className="font-bold">Include my name with my answers</span>
              <span className="block text-sm text-black/60">Your answers will then be tied to your name and email.</span>
            </span>
          </label>
        </div>
        {anonymity === "identified" && (
          <div className="space-y-4 rounded-2xl border border-black/10 bg-white/60 p-4">
            <TextInput
              id="attendee-name"
              label="Full name"
              value={contact.fullName}
              onChange={(fullName) => setContact({ ...contact, fullName })}
              error={errors.fullName}
              autoComplete="name"
              required
            />
            <TextInput
              id="attendee-email"
              label="Email"
              type="email"
              value={contact.email}
              onChange={(email) => setContact({ ...contact, email })}
              error={errors.email}
              autoComplete="email"
              required
            />
            <TextInput
              id="attendee-agency"
              label="Agency name"
              value={contact.company}
              onChange={(company) => setContact({ ...contact, company })}
              autoComplete="organization"
            />
            <label className="flex items-start gap-3 text-[15px]">
              <input
                type="checkbox"
                checked={contact.contactPermission}
                onChange={(event) => setContact({ ...contact, contactPermission: event.target.checked })}
                className="mt-1 h-4 w-4 accent-black"
              />
              <span>{SURVEY_COPY.contactPermission}</span>
            </label>
          </div>
        )}
      </fieldset>
    </div>
  );
}

function PartnerIdentity({
  contact,
  setContact,
  errors,
}: {
  contact: ContactDraft;
  setContact: (contact: ContactDraft) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-black/5 px-4 py-3 text-sm leading-relaxed text-black/75">
        {SURVEY_COPY.partnerIdentityNotice}
      </p>
      <TextInput
        id="partner-company"
        label="Company name"
        value={contact.company}
        onChange={(company) => setContact({ ...contact, company })}
        error={errors.company}
        autoComplete="organization"
        required
      />
      <TextInput
        id="partner-name"
        label="Your full name"
        value={contact.fullName}
        onChange={(fullName) => setContact({ ...contact, fullName })}
        error={errors.fullName}
        autoComplete="name"
        required
      />
      <TextInput
        id="partner-email"
        label="Email"
        type="email"
        value={contact.email}
        onChange={(email) => setContact({ ...contact, email })}
        error={errors.email}
        autoComplete="email"
        required
      />
      <TextInput
        id="partner-title"
        label="Job title"
        value={contact.title}
        onChange={(title) => setContact({ ...contact, title })}
        autoComplete="organization-title"
      />
    </div>
  );
}

function Review({
  audience,
  answers,
  role,
  identified,
  contact,
  canEdit,
  onEdit,
}: {
  audience: Audience;
  answers: Answers;
  role: string | null;
  identified: boolean;
  contact: ContactDraft;
  canEdit: boolean;
  onEdit: (stepIndex: number) => void;
}) {
  const steps = stepsFor(audience);
  const identityLines =
    audience === "partner"
      ? [contact.company, contact.fullName, contact.email, contact.title].filter(Boolean)
      : [
          `Role: ${ATTENDEE_ROLES.find((option) => option.value === role)?.label ?? "No answer"}`,
          identified
            ? `Identified: ${[contact.fullName, contact.email, contact.company].filter(Boolean).join(", ")}${contact.contactPermission ? " (may contact me)" : ""}`
            : "Anonymous",
        ];

  return (
    <div className="space-y-8">
      <p className="leading-relaxed text-black/70">
        Check your answers. Unanswered questions are sent as unanswered. Nothing is saved until you press Submit.
      </p>
      {steps.map((step, index) => (
        <div key={step.id} className="space-y-3 border-t border-black/10 pt-6 first:border-t-0 first:pt-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">{step.title}</h2>
            {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(index)}
              className="text-sm font-semibold underline underline-offset-4"
              aria-label={`Edit ${step.title}`}
            >
              Edit
            </button>
            )}
          </div>
          {index === 0 && (
            <ul className="space-y-1 text-[15px] text-black/80">
              {identityLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          <dl className="space-y-3">
            {step.questions.map((question) => {
              const lines =
                question.id === "p_q2_attainment" && answers.p_q1_objective === "no_objective"
                  ? ["Not applicable"]
                  : describeAnswer(question, answers);
              return (
                <div key={question.id}>
                  <dt className="text-sm font-semibold text-black/60">
                    {question.number}. {question.prompt}
                  </dt>
                  {lines.map((line, i) => (
                    <dd key={i} className={`whitespace-pre-wrap text-[15px] ${line === "No answer" ? "text-black/40" : "text-black"}`}>
                      {line}
                    </dd>
                  ))}
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}

export default Survey;
