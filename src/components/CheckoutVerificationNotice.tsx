import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, LoaderCircle, Mail } from "lucide-react";

type VerificationStatus =
  | "neutral"
  | "checking"
  | "registration_confirmed"
  | "payment_recorded"
  | "pending"
  | "not_found"
  | "unavailable";

interface CheckoutVerificationNoticeProps {
  sessionId: string | null;
}

const styles: Record<VerificationStatus, string> = {
  neutral: "border-border bg-card text-foreground",
  checking: "border-primary/30 bg-primary/5 text-foreground",
  registration_confirmed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-950",
  payment_recorded: "border-amber-500/40 bg-amber-500/10 text-amber-950",
  pending: "border-primary/30 bg-primary/5 text-foreground",
  not_found: "border-amber-500/40 bg-amber-500/10 text-amber-950",
  unavailable: "border-amber-500/40 bg-amber-500/10 text-amber-950",
};

const copy: Record<VerificationStatus, { title: string; body: string }> = {
  neutral: {
    title: "Check your email for confirmation",
    body: "Use the purchase confirmation sent to the checkout email as your registration record.",
  },
  checking: {
    title: "Checking your checkout",
    body: "This usually takes only a moment.",
  },
  registration_confirmed: {
    title: "Registration confirmed",
    body: "The paid checkout and an eligible FORMULA 2026 registration are recorded.",
  },
  payment_recorded: {
    title: "Payment recorded — attendee setup remains",
    body: "The paid checkout is recorded. Assign every purchased seat to a named attendee before account setup.",
  },
  pending: {
    title: "Confirmation is still processing",
    body: "Check your email shortly. If it does not arrive, contact the FORMULA team with the checkout reference below.",
  },
  not_found: {
    title: "Check your email for confirmation",
    body: "This return link could not confirm the checkout. Contact the FORMULA team if your purchase confirmation is missing.",
  },
  unavailable: {
    title: "Status check is temporarily unavailable",
    body: "Check your confirmation email. If it is missing, retry this page or contact the FORMULA team with the checkout reference below.",
  },
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serverStatuses = new Set<VerificationStatus>([
  "registration_confirmed",
  "payment_recorded",
  "pending",
  "not_found",
  "unavailable",
]);

const checkRegistration = async (
  sessionId: string,
  signal: AbortSignal,
): Promise<VerificationStatus> => {
  const result = await fetch(`${SUPABASE_URL}/functions/v1/verify-formula-registration`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId }),
    signal,
  });
  const data = await result.json().catch(() => null) as { status?: unknown } | null;
  if (
    !data?.status ||
    typeof data.status !== "string" ||
    !serverStatuses.has(data.status as VerificationStatus)
  ) {
    return "unavailable";
  }
  return data.status as VerificationStatus;
};

const CheckoutVerificationNotice = ({ sessionId }: CheckoutVerificationNoticeProps) => {
  const [status, setStatus] = useState<VerificationStatus>(sessionId ? "checking" : "neutral");

  useEffect(() => {
    if (!sessionId) {
      setStatus("neutral");
      return;
    }

    let active = true;
    let requestController: AbortController | null = null;
    setStatus("checking");

    void (async () => {
      let lastStatus: VerificationStatus = "unavailable";
      for (let attempt = 0; attempt < 2 && active; attempt += 1) {
        requestController = new AbortController();
        const timeout = window.setTimeout(() => requestController?.abort(), 6_000);
        try {
          lastStatus = await checkRegistration(sessionId, requestController.signal);
        } catch {
          lastStatus = "unavailable";
        } finally {
          window.clearTimeout(timeout);
        }
        if (!active) return;
        setStatus(lastStatus);
        if (!["pending", "unavailable"].includes(lastStatus) || attempt === 1) return;
        await new Promise((resolve) => window.setTimeout(resolve, 2_000));
      }
    })();

    return () => {
      active = false;
      requestController?.abort();
    };
  }, [sessionId]);

  const Icon = status === "registration_confirmed"
    ? CheckCircle2
    : status === "checking"
      ? LoaderCircle
      : status === "neutral"
        ? Mail
        : CircleAlert;

  return (
    <section
      aria-live="polite"
      className={`mb-8 rounded-lg border p-6 text-left ${styles[status]}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${status === "checking" ? "animate-spin" : ""}`} />
        <div>
          <h2 className="text-lg font-semibold">{copy[status].title}</h2>
          <p className="mt-1 text-sm opacity-80">{copy[status].body}</p>
        </div>
      </div>
    </section>
  );
};

export default CheckoutVerificationNotice;
