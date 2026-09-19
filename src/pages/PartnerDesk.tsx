import { useState } from "react";
import SEO from "@/components/SEO";

/**
 * Floor runbook for whoever is staffing the partner desk at the event.
 *
 * Deliberately outside the marketing chrome — no header, no ticket footer, no
 * cursor. It gets opened one-handed while an attendee stands there waiting, so
 * the page is a tool, not a page of the site. `noindex` because it names
 * internal escalation paths and is linked from nowhere; the URL is handed out
 * directly.
 */

const SIGN_IN = "https://flow.theformulaforum.com/partnerhub/#/login";

/** Button names exactly as they read on screen, so the page matches the app. */
const Tap = ({ children }: { children: React.ReactNode }) => (
  <span className="whitespace-nowrap rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] font-semibold">
    {children}
  </span>
);

const STEPS = [
  <>Tap <Tap>…</Tap> top right, then <Tap>Admin</Tap></>,
  <>Tap <Tap>Partners</Tap></>,
  <>Search the company — a few letters is enough</>,
  <>Tap the company, then <Tap>Team</Tap></>,
];

type Branch = {
  id: string;
  question: string;
  verdict: string;
  tone: "act" | "ok";
  body: React.ReactNode;
};

const BRANCHES: Branch[] = [
  {
    id: "missing",
    question: "Their name isn’t on the list",
    verdict: "Add them",
    tone: "act",
    body: (
      <>
        <p>
          Tap <Tap>Add Team Member</Tap> — name, email, and a password{" "}
          <strong className="font-semibold">you</strong> make up.
        </p>
        <p>
          Copy the credentials box before you close it — that is the only time the password is
          shown.
        </p>
        <p className="text-white/60">This is the most common one by far.</p>
      </>
    ),
  },
  {
    id: "ready",
    question: "It says “Live and ready”",
    verdict: "Nothing is broken",
    tone: "ok",
    body: (
      <p>
        They are almost certainly signed in with a different email. Read them the email on that
        row and have them sign out and back in with it.
      </p>
    ),
  },
  {
    id: "red",
    question: "It says something else, or lines are red",
    verdict: "Verify & Repair",
    tone: "act",
    body: (
      <>
        <p>
          Tap their name, then <Tap>Verify &amp; Repair</Tap>. That fixes almost everything.
        </p>
        <p>
          <strong className="font-semibold">“Connection verified and live.”</strong> Done — have
          them fully close and reopen the app.
        </p>
        <p>
          <strong className="font-semibold">
            “Repair completed, but another item still needs attention.”
          </strong>{" "}
          Check the red lines against the table below.
        </p>
        <p>
          <strong className="font-semibold">“Connection could not be repaired.”</strong> Stop.
          Screenshot it and send it to Justin.
        </p>
      </>
    ),
  },
  {
    id: "wrongorg",
    question: "“Correct organization” is red",
    verdict: "They’re on the wrong company",
    tone: "act",
    body: (
      <>
        <p>
          Tap <Tap>Remove from org</Tap> on the wrong company, then add them on the right one.
        </p>
        <p>Be certain which company is right before you remove anyone.</p>
        <p className="text-white/60">
          A coming app update adds a one-tap <Tap>Connect to this org</Tap> button instead.
        </p>
      </>
    ),
  },
];

const RED_LINES: [React.ReactNode, React.ReactNode][] = [
  ["Account connected", "Verify & Repair. Still red means the email is wrong — check it with them"],
  ["Correct organization", "Wrong company — see above"],
  ["Partner page active", "Not yours. Send to Justin"],
  [
    "AI company context",
    <>
      Not yours. Send to Justin. <em>“Not required for this partner”</em> is fine, leave it
    </>,
  ],
  [
    <>
      Workbook capture
      <br />
      Dashboard access
    </>,
    "Nothing — see “Ignore these two”",
  ],
  ["Anything else", "Verify & Repair"],
];

const ESCALATE: React.ReactNode[] = [
  <>
    <strong className="font-semibold">“Connection could not be repaired.”</strong> Already tried
    and failed
  </>,
  <>
    <strong className="font-semibold">Partner page active is red.</strong> The company’s page is
    switched off
  </>,
  <>
    <strong className="font-semibold">The company isn’t in Partners at all.</strong> Never set up
    — don’t create it
  </>,
  <>
    <strong className="font-semibold">AI company context is red</strong> and doesn’t say{" "}
    <em>not required</em>
  </>,
  <>
    <strong className="font-semibold">Same red line after two repairs.</strong> Repair, Check
    again, repair once more. If it holds, stop
  </>,
  <>
    <strong className="font-semibold">Any password reset.</strong> The credentials box is
    one-time only
  </>,
];

const PartnerDesk = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="Partner Desk | Formula Forum 2026"
        description="Floor reference for partner team access at Formula Forum 2026."
        path="/desk"
        noindex
      />

      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-[18px] pb-16 pt-7">
        <header>
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
            Formula Forum · Orlando · Oct 14–16
          </p>
          <h1 className="m-0 text-[34px] font-extrabold leading-[1.04] tracking-tight">
            Partner Desk
          </h1>
          <p className="mt-2 text-[15px] text-white/65">
            Someone says their team access isn’t working. Start at the top.
          </p>
        </header>

        <a
          href={SIGN_IN}
          className="block rounded-[3px] bg-[#f7641d] px-5 py-4 text-center text-lg font-extrabold tracking-tight text-black"
        >
          Sign in
          <span className="mt-1 block font-mono text-[11px] font-normal tracking-normal opacity-80">
            your own email &amp; password · bookmark this
          </span>
        </a>

        <section>
          <h2 className="mb-3 text-[21px] font-bold tracking-tight">Get to their team</h2>
          <ol className="m-0 flex list-none flex-col gap-px p-0">
            {STEPS.map((step, i) => (
              <li
                key={i}
                className="grid grid-cols-[26px_1fr] items-start gap-3 bg-white/[0.06] px-4 py-3 first:rounded-t-[3px] last:rounded-b-[3px]"
              >
                <span className="pt-0.5 font-mono text-[13px] text-[#f7641d]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-[21px] font-bold tracking-tight">Now look at their name</h2>
          <div className="flex flex-col gap-2">
            {BRANCHES.map((branch) => {
              const isOpen = open === branch.id;
              return (
                <div key={branch.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : branch.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-[3px] border border-white/10 border-l-[3px] px-4 py-3.5 text-left ${
                      isOpen ? "border-l-[#f7641d] bg-white/[0.09]" : "border-l-white/30 bg-white/[0.06]"
                    }`}
                  >
                    <span className="font-semibold">{branch.question}</span>
                    <span className="flex-none text-[13px] text-white/45">
                      {isOpen ? "hide" : "show"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="space-y-2.5 rounded-b-[3px] border border-t-0 border-white/10 bg-white/[0.06] px-4 py-3.5">
                      <p
                        className={`text-[17px] font-bold ${
                          branch.tone === "ok" ? "text-[#3fb984]" : "text-[#f7641d]"
                        }`}
                      >
                        {branch.verdict}
                      </p>
                      {branch.body}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[3px] border-l-[3px] border-[#52b7d3] bg-[#52b7d3]/10 px-4 py-4">
          <h2 className="mb-3 text-[21px] font-bold tracking-tight text-[#52b7d3]">
            Ignore these two
          </h2>
          <p>
            Until the event actually starts, these are red on{" "}
            <strong className="font-semibold">everybody</strong>:
          </p>
          <ul className="my-2 list-disc pl-5">
            <li>Workbook capture live now</li>
            <li>Dashboard access live now</li>
          </ul>
          <p>
            Red because those parts of the event aren’t open yet — not because of that person.{" "}
            <strong className="font-semibold">
              If those two are the only red lines, they are fine.
            </strong>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[21px] font-bold tracking-tight">If a line is red</h2>
          <div className="overflow-x-auto rounded-[3px] bg-white/[0.06]">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr>
                  <th className="border-b border-white/10 px-3 py-2.5 text-left font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-white/45">
                    Red line
                  </th>
                  <th className="border-b border-white/10 px-3 py-2.5 text-left font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-white/45">
                    What you do
                  </th>
                </tr>
              </thead>
              <tbody>
                {RED_LINES.map(([line, action], i) => (
                  <tr key={i}>
                    <td className="w-[40%] border-b border-white/10 px-3 py-2.5 align-top font-semibold last:border-b-0">
                      {line}
                    </td>
                    <td className="border-b border-white/10 px-3 py-2.5 align-top">{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <details className="rounded-[3px] bg-white/[0.06] px-4 open:pb-4">
          <summary className="cursor-pointer py-3.5 text-base font-semibold">
            Adding someone properly
          </summary>
          <div className="space-y-2.5">
            <p>
              Before you add anyone, check they aren’t already on the list under a different
              email. Two accounts for one person is worse than none.
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="font-semibold">Full Name</strong>
              </li>
              <li>
                <strong className="font-semibold">Email</strong> — have them spell it out. This is
                what causes rework
              </li>
              <li>
                <strong className="font-semibold">Password</strong> — you make it up; it is not
                something they already have
              </li>
            </ul>
            <p>
              Tap <Tap>Create Account</Tap> then <Tap>Copy All</Tap> in the box that appears,
              and send it to them.
            </p>
            <p>
              Say it out loud: <em>“this is your login for the Formula app — use it on your phone
              too.”</em> People assume it’s web-only and never install the app.
            </p>
            <p>
              Back on the team list, tap <Tap>Check again</Tap> if their row doesn’t appear. New
              people usually go straight to Live and ready.
            </p>
          </div>
        </details>

        <details className="rounded-[3px] bg-white/[0.06] px-4 open:pb-4">
          <summary className="cursor-pointer py-3.5 text-base font-semibold">
            Send these to Justin
          </summary>
          <div className="space-y-2.5">
            <ul className="list-disc space-y-1.5 pl-5">
              {ESCALATE.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              Send a screenshot of the whole status section, the company name, their email spelled
              out, and what you already tried.
            </p>
            <p className="text-white/60">
              That last one saves a round trip: “repaired twice, still red on Membership
              confirmed.”
            </p>
          </div>
        </details>

        <section className="rounded-[3px] border-l-[3px] border-[#f08a72] bg-[#f08a72]/10 px-4 py-3.5 text-[15px]">
          <strong className="font-semibold">Never</strong> remove someone just because their
          status looks wrong. Removing is only for the wrong-company case. Everything else is
          Verify &amp; Repair, or Justin.
        </section>

        <section>
          <h2 className="mb-3 text-[21px] font-bold tracking-tight">While you wait on Justin</h2>
          <p>
            “I’ve got it logged and Justin’s on it — here’s what does work for you today.”
          </p>
          <p className="mt-2 text-[15px] text-white/65">
            Almost everyone in this situation can still use the app for everything except the
            partner-only parts. Don’t leave them thinking they’re locked out.
          </p>
        </section>

        <footer className="border-t border-white/10 pt-4 text-[13px] text-white/45">
          Partner Desk · staff reference · not linked from the site
        </footer>
      </main>
    </div>
  );
};

export default PartnerDesk;
