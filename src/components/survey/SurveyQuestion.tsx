import type { ReactNode } from "react";
import {
  SPECIFY_MAX,
  SURVEY_COPY,
  type AnswerValue,
  type ChoiceQuestion,
  type CountQuestion,
  type GridQuestion,
  type MultiQuestion,
  type ScaleQuestion,
  type SurveyOption,
  type SurveyQuestion as Question,
  type TextQuestion,
} from "@/lib/formulaSurvey";

export type Answers = Record<string, AnswerValue | undefined>;

interface FieldProps<Q extends Question> {
  question: Q;
  answers: Answers;
  setAnswer: (id: string, value: AnswerValue | undefined) => void;
  error?: string | null;
}

const legendClass = "text-lg font-bold leading-snug text-black md:text-xl";
const helperClass = "mt-1 text-sm leading-relaxed text-black/65";
const pill =
  "relative inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-black/15 bg-white px-4 py-2.5 text-left text-[15px] leading-snug text-black transition hover:border-black/40 has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[hsl(var(--secondary))] has-[:focus-visible]:ring-offset-2";
const clearButton = "mt-2 text-sm font-semibold text-black/55 underline underline-offset-4 hover:text-black";

function Radio({
  name,
  option,
  checked,
  onSelect,
}: {
  name: string;
  option: SurveyOption;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={pill}>
      <input type="radio" name={name} value={option.value} checked={checked} onChange={onSelect} className="sr-only" />
      {option.label}
    </label>
  );
}

function ClearAnswer({ onClear, visible }: { onClear: () => void; visible: boolean }) {
  if (!visible) return null;
  return (
    <button type="button" onClick={onClear} className={clearButton}>
      Clear answer
    </button>
  );
}

function Shell({ question, children, error }: { question: Question; children: ReactNode; error?: string | null }) {
  const helperId = question.helper ? `${question.id}-helper` : undefined;
  const errorId = error ? `${question.id}-error` : undefined;
  return (
    <fieldset className="space-y-4" aria-describedby={[helperId, errorId].filter(Boolean).join(" ") || undefined}>
      <legend className="mb-1">
        <span className={legendClass}>
          <span className="mr-2 text-black/40">{question.number}.</span>
          {question.prompt}
        </span>
      </legend>
      {question.helper && (
        <p id={helperId} className={helperClass}>
          {question.helper}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function ChoiceField({ question, answers, setAnswer, disabledNote }: FieldProps<ChoiceQuestion> & { disabledNote?: string }) {
  const current = answers[question.id];
  if (disabledNote) {
    return (
      <Shell question={question}>
        <p className="rounded-xl bg-black/5 px-4 py-3 text-sm text-black/70">{disabledNote}</p>
      </Shell>
    );
  }
  const specifyKey = `${question.id}_other`;
  const specifyOption = question.options.find((option) => option.specify);
  return (
    <Shell question={question}>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <Radio
            key={option.value}
            name={question.id}
            option={option}
            checked={current === option.value}
            onSelect={() => setAnswer(question.id, option.value)}
          />
        ))}
      </div>
      {specifyOption && current === specifyOption.value && (
        <label className="block">
          <span className="text-sm font-semibold text-black/70">Please specify (optional)</span>
          <input
            type="text"
            maxLength={SPECIFY_MAX}
            value={typeof answers[specifyKey] === "string" ? (answers[specifyKey] as string) : ""}
            onChange={(event) => setAnswer(specifyKey, event.target.value || undefined)}
            className="mt-1 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black focus:ring-2 focus:ring-[hsl(var(--secondary))]"
          />
        </label>
      )}
      <ClearAnswer
        visible={current !== undefined}
        onClear={() => {
          setAnswer(question.id, undefined);
          if (specifyOption) setAnswer(specifyKey, undefined);
        }}
      />
    </Shell>
  );
}

function GridField({ question, answers, setAnswer }: FieldProps<GridQuestion>) {
  const current = (answers[question.id] as Record<string, string> | undefined) ?? {};
  const setRow = (rowId: string, value: string | undefined) => {
    const next = { ...current };
    if (value === undefined) delete next[rowId];
    else next[rowId] = value;
    setAnswer(question.id, Object.keys(next).length ? next : undefined);
  };
  return (
    <Shell question={question}>
      <div className="space-y-3">
        {question.rows.map((row) => (
          <fieldset key={row.id} className="rounded-2xl border border-black/10 bg-white/60 p-4">
            <legend className="sr-only">{row.label}</legend>
            <p aria-hidden="true" className="mb-3 font-bold text-black">
              {row.label}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {question.options.map((option) => (
                <Radio
                  key={option.value}
                  name={`${question.id}-${row.id}`}
                  option={option}
                  checked={current[row.id] === option.value}
                  onSelect={() => setRow(row.id, option.value)}
                />
              ))}
            </div>
            <ClearAnswer visible={current[row.id] !== undefined} onClear={() => setRow(row.id, undefined)} />
          </fieldset>
        ))}
      </div>
    </Shell>
  );
}

function ScaleField({ question, answers, setAnswer }: FieldProps<ScaleQuestion>) {
  const current = answers[question.id];
  const points = Array.from({ length: question.max - question.min + 1 }, (_, i) => question.min + i);
  return (
    <Shell question={question}>
      <div>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
          {points.map((point) => (
            <label key={point} className={`${pill} justify-center px-0`}>
              <input
                type="radio"
                name={question.id}
                value={point}
                checked={current === point}
                onChange={() => setAnswer(question.id, point)}
                className="sr-only"
                aria-label={
                  point === question.min
                    ? `${point}, ${question.minLabel}`
                    : point === question.max
                      ? `${point}, ${question.maxLabel}`
                      : String(point)
                }
              />
              {point}
            </label>
          ))}
        </div>
        <div aria-hidden="true" className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-wide text-black/50">
          <span>
            {question.min} · {question.minLabel}
          </span>
          <span>
            {question.max} · {question.maxLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {question.extras.map((option) => (
          <Radio
            key={option.value}
            name={question.id}
            option={option}
            checked={current === option.value}
            onSelect={() => setAnswer(question.id, option.value)}
          />
        ))}
      </div>
      <ClearAnswer visible={current !== undefined} onClear={() => setAnswer(question.id, undefined)} />
    </Shell>
  );
}

function CountField({ question, answers, setAnswer, error }: FieldProps<CountQuestion>) {
  const current = answers[question.id];
  const inputId = `${question.id}-number`;
  return (
    <Shell question={question} error={error}>
      <div>
        <label htmlFor={inputId} className="text-sm font-semibold text-black/70">
          Number of agencies (0 is a valid answer)
          <span className="sr-only">, question {question.number}</span>
        </label>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={typeof current === "number" ? String(current) : ""}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
            // A stray non-digit keystroke must not wipe a chosen "Unsure" etc.
            if (digits === "" && typeof current === "string") return;
            setAnswer(question.id, digits === "" ? undefined : Math.min(Number(digits), question.max));
          }}
          className="mt-1 w-40 rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black focus:ring-2 focus:ring-[hsl(var(--secondary))]"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <span className="sr-only">Or choose:</span>
        {question.extras.map((option) => (
          <Radio
            key={option.value}
            name={question.id}
            option={option}
            checked={current === option.value}
            onSelect={() => setAnswer(question.id, option.value)}
          />
        ))}
      </div>
      <ClearAnswer visible={current !== undefined} onClear={() => setAnswer(question.id, undefined)} />
    </Shell>
  );
}

function TextField({ question, answers, setAnswer }: FieldProps<TextQuestion>) {
  const current = typeof answers[question.id] === "string" ? (answers[question.id] as string) : "";
  const warningId = `${question.id}-warning`;
  return (
    <Shell question={question}>
      <textarea
        aria-label={question.prompt}
        aria-describedby={warningId}
        rows={5}
        maxLength={question.maxLength}
        value={current}
        onChange={(event) => setAnswer(question.id, event.target.value || undefined)}
        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black focus:ring-2 focus:ring-[hsl(var(--secondary))]"
      />
      <div className="flex flex-wrap justify-between gap-2 text-xs text-black/55">
        <p id={warningId}>{SURVEY_COPY.freeTextWarning}</p>
        <p aria-hidden="true">
          {current.length}/{question.maxLength}
        </p>
      </div>
    </Shell>
  );
}

function MultiField({ question, answers, setAnswer }: FieldProps<MultiQuestion>) {
  const current = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : [];
  const exclusive = new Set(question.options.filter((option) => option.exclusive).map((option) => option.value));
  const specificCount = current.filter((value) => !exclusive.has(value)).length;
  const atLimit = specificCount >= question.maxSpecific;

  const toggle = (value: string, checked: boolean) => {
    let next: string[];
    if (!checked) next = current.filter((item) => item !== value);
    // An exclusive choice ("No preference", "Neither") replaces everything else,
    // and any specific window replaces an exclusive choice.
    else if (exclusive.has(value)) next = [value];
    else next = [...current.filter((item) => !exclusive.has(item)), value];
    setAnswer(question.id, next.length ? next : undefined);
  };

  return (
    <Shell question={question}>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => {
          const checked = current.includes(option.value);
          const blocked = !checked && !option.exclusive && atLimit;
          return (
            <label
              key={option.value}
              className={`${pill} gap-3 ${blocked ? "cursor-not-allowed opacity-45 hover:border-black/15" : ""}`}
            >
              <input
                type="checkbox"
                name={question.id}
                value={option.value}
                checked={checked}
                disabled={blocked}
                onChange={(event) => toggle(option.value, event.target.checked)}
                className="h-4 w-4 accent-white"
              />
              {option.label}
            </label>
          );
        })}
      </div>
      <p aria-live="polite" className="text-xs text-black/55">
        {atLimit ? `You've picked ${question.maxSpecific}. Untick one to choose a different window.` : ""}
      </p>
    </Shell>
  );
}

export function SurveyQuestionField(props: FieldProps<Question> & { disabledNote?: string }) {
  const { question } = props;
  switch (question.kind) {
    case "choice":
      return <ChoiceField {...props} question={question} />;
    case "grid":
      return <GridField {...props} question={question} />;
    case "scale":
      return <ScaleField {...props} question={question} />;
    case "count":
      return <CountField {...props} question={question} />;
    case "text":
      return <TextField {...props} question={question} />;
    case "multi":
      return <MultiField {...props} question={question} />;
  }
}

const labelFor = (options: SurveyOption[], value: unknown) =>
  options.find((option) => option.value === value)?.label ?? String(value);

/** One-line (or per-row) summary of an answer for the review screen. */
export function describeAnswer(question: Question, answers: Answers): string[] {
  const value = answers[question.id];
  if (value === undefined) return ["No answer"];
  switch (question.kind) {
    case "choice": {
      const label = labelFor(question.options, value);
      const other = answers[`${question.id}_other`];
      return [typeof other === "string" && value === "other" ? `${label}: ${other}` : label];
    }
    case "grid": {
      const rows = value as Record<string, string>;
      return question.rows.map((row) => `${row.label}: ${rows[row.id] ? labelFor(question.options, rows[row.id]) : "No answer"}`);
    }
    case "scale":
      return [typeof value === "number" ? `${value} out of ${question.max}` : labelFor(question.extras, value)];
    case "count":
      return [typeof value === "number" ? String(value) : labelFor(question.extras, value)];
    case "text":
      return [String(value)];
    case "multi":
      return [(value as string[]).map((item) => labelFor(question.options, item)).join(", ")];
  }
}
