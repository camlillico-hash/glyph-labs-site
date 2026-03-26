import {
  ArrowRight,
  CheckCircle2,
  CircleSlash2,
  Compass,
  Layers,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Cam Lillico | Referrals",
  robots: { index: false, follow: false },
};

const calendlyUrl = "https://calendar.app.google/M4pokXD8CBpc1c4U6";

const icp = [
  "Founder-led or growth-stage companies, typically $2M–$50M in revenue",
  "Leadership teams with strong intent but inconsistent execution",
  "Teams willing to have candid conversations and operate with real accountability",
  "Companies that want operating discipline without bureaucracy",
];

const antiIcp = [
  "Teams looking for motivation without implementation",
  "Organizations unwilling to commit to a weekly and quarterly operating cadence",
  "Founders who want outsourced decision-making instead of aligned leadership execution",
];

const discoverySteps = [
  {
    title: "About us",
    text: "Cam briefly explains BOS360, his coaching approach, and what strong Vision, Momentum, and Health look like in practice.",
  },
  {
    title: "About you",
    text: "The team shares a concise business history, revenue snapshot, team size, biggest goal, biggest challenges, strengths, and quick ratings on meetings, alignment, and accountability.",
  },
  {
    title: "Core model",
    text: "Cam introduces the BOS360 model so the team can see how Business, Brand, Team, Strategy, Execution, and Culture fit together.",
  },
  {
    title: "Tools",
    text: "A walkthrough of the foundational tools that create operating clarity and traction: flywheel, scoreboard, accountability chart, meeting rhythm, and playbooks.",
  },
  {
    title: "Process",
    text: "How implementation works from Discovery to launch days to the ongoing quarterly and annual rhythm.",
  },
];

const implementation = [
  {
    title: "Discovery Meeting (90 min)",
    text: "90 minutes with the leadership team to assess fit, surface issues, and show the model.",
  },
  {
    title: "Momentum Day (full day)",
    text: "Get everything in motion: core model, leadership fundamentals, flywheel, accountability chart, scoreboard, quarterly priorities, meeting rhythm, and playbooks.",
  },
  {
    title: "Vision Day (~30 days later)",
    text: "Review the tools, work out the kinks, and build the strategic plan so the team is aligned on where it is going and how it plans to get there.",
  },
  {
    title: "Healthy Day (~30 days later)",
    text: "Review progress, clarify core values and brand identity, and strengthen the culture and team-health side of the operating system.",
  },
  {
    title: "Annual Rhythm",
    text: "After launch: one 2-day Annual plus three single-day Quarterlies each year to refresh priorities, tackle issues, and keep momentum compounding.",
  },
];

export default function ReferralsPage() {
  return (
    <main className="coaching-theme min-h-screen bg-neutral-950 text-slate-100">
      {/* Background glow accents */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#ed7d31]/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-neutral-600/20 blur-3xl" />
      </div>

      {/* HEADER (mirrors /coaching) */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div className="inline-flex min-w-0 items-center gap-2" aria-label="Cam Lillico Coaching">
            <a href="/coaching" className="inline-flex items-center" aria-label="Cam Lillico Coaching home">
              <img
                src="/logos/glyphlabs-coaching-mark.png"
                alt="Coaching mark"
                className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              />
            </a>
            <span className="hidden rounded-full border border-neutral-600 bg-neutral-800/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-orange-200 sm:inline-flex">
              Cam Lillico Business Coaching
            </span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <a
              href="/strength-test"
              className="rounded-lg border border-cyan-400/50 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10"
            >
              Start Strength Test
            </a>
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-3 py-2 text-xs font-semibold text-slate-950"
            >
              Book 90-min Discovery
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-2 sm:hidden">
        <span className="mobile-coaching-badge inline-flex rounded-full border border-neutral-600 bg-neutral-800/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-orange-200">
          Cam Lillico Business Coaching
        </span>
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-10 md:pb-10 md:pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Referrals</p>
        <h1 className="mt-3 max-w-5xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          A forwardable way to help the right founders take action.
        </h1>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="text-lg text-slate-300">
            <p>
              Cam works with founder-led and growth-stage leadership teams to install a practical operating cadence so priorities are
              clear, accountability is real, and execution improves week by week.
            </p>
            <p className="mt-4">
              The starting point is a structured <span className="text-orange-200 font-semibold">90-minute Discovery Meeting</span> designed
              to create fast clarity, surface friction, and confirm fit.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-600 bg-neutral-900/85 p-6 shadow-lg shadow-black/30">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Primary next step</p>
            <h2 className="mt-2 text-2xl font-bold">Book the 90-minute Discovery</h2>
            <p className="mt-3 text-slate-300">If you’re introducing someone, this is the simplest and highest-signal first move.</p>
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-5 py-2.5 text-center text-base font-extrabold text-slate-950 transition hover:opacity-90"
            >
              Book 90-min Discovery <ArrowRight size={18} aria-hidden />
            </a>
            <p className="mt-3 text-xs text-slate-400">Opens in a new tab.</p>
          </div>
        </div>
      </section>

      {/* FIT */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <Compass size={22} aria-hidden className="text-[#ed7d31]" />
          Who this is for (and not for)
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <h3 className="inline-flex items-center gap-2 text-xl font-bold text-orange-200">
              <CheckCircle2 size={18} aria-hidden /> ICP
            </h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              {icp.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <h3 className="inline-flex items-center gap-2 text-xl font-bold text-slate-100">
              <CircleSlash2 size={18} aria-hidden /> Anti-ICP
            </h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              {antiIcp.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* WHY CAM */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <Star size={22} aria-hidden className="text-[#ed7d31]" />
          Why founders work with Cam
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <ul className="space-y-3 text-slate-300">
              <li>• Operator credibility, not theory (20+ years in business and leadership roles).</li>
              <li>• Deep repetition (6+ years facilitating this work across hundreds of sessions).</li>
              <li>• Fast clarity (Discovery Meeting is designed to create immediate insight).</li>
              <li>• Structured, not bureaucratic (discipline without turning the company into a process museum).</li>
              <li>• Facilitation style senior teams trust (creates conditions for sharper decisions and follow-through).</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Street-cred shorthand</p>
            <p className="mt-3 text-slate-200 font-semibold">
              Senior operating experience. Growth-stage B2B SaaS pattern recognition. Hundreds of facilitated sessions. Proven BOS360
              structure. Calm, direct facilitation that drives decisions and accountability.
            </p>

            <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Simple articulation</p>
              <p className="mt-3 text-slate-100 text-base leading-relaxed">
                “Cam helps founder-led leadership teams build a simpler, more disciplined way of running the business. He uses BOS360
                to create clarity, accountability, and momentum so the team executes better quarter after quarter.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DISCOVERY */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <Layers size={22} aria-hidden className="text-[#ed7d31]" />
          How the 90-minute Discovery Meeting works
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-5">
          {discoverySteps.map((s) => (
            <div key={s.title} className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6 md:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Step</p>
              <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-600 bg-neutral-900/85 p-6 shadow-lg shadow-black/30">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">What the team gets</p>
          <p className="mt-3 text-slate-300">
            A fast, structured diagnostic of friction points, alignment gaps, and execution bottlenecks. The value is not abstract
            inspiration — it’s sharper visibility into what is actually slowing the business down and what stronger operating
            discipline would look like.
          </p>
        </div>
      </section>

      {/* IMPLEMENTATION */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <h2 className="text-3xl font-bold md:text-4xl">The BOS360 implementation process</h2>
        <p className="mt-4 max-w-4xl text-slate-300">
          The process is intentionally simple and staged. It begins with diagnosis, moves into a three-day launch over roughly 60
          days, and then settles into an annual operating rhythm.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {implementation.map((x) => (
            <div key={x.title} className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
              <h3 className="text-xl font-bold text-slate-100">{x.title}</h3>
              <p className="mt-3 text-slate-300">{x.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-700 bg-neutral-950/40 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">How progress becomes visible</p>
          <p className="mt-3 text-slate-300">
            BOS360 makes progress tangible by clarifying the strategic plan, setting quarterly priorities, building a scoreboard of
            weekly numbers, creating a weekly 5-STAR meeting rhythm, and assigning clear accountability.
          </p>
        </div>
      </section>

      {/* FORWARDABLE LANGUAGE */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <h2 className="text-3xl font-bold md:text-4xl">Forwardable language you can use</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Short referral intro</p>
            <p className="mt-3 text-slate-200 leading-relaxed">
              “I want to introduce you to Cam Lillico. He works with founder-led leadership teams to create more clarity, stronger
              accountability, and better execution. He is strong with growth-stage companies that have good people and ambition,
              but need a simpler and more disciplined way to run the business. His 90-minute Discovery Meeting is a very good first
              step because it quickly surfaces what is really getting in the way.”
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-600 bg-neutral-900/85 p-6 shadow-lg shadow-black/30">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Three reasons</p>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li>• Real operator credibility and growth-stage leadership pattern recognition.</li>
              <li>• Proven BOS360 structure that creates clarity and traction without overcomplication.</li>
              <li>• Even the first 90 minutes tends to create immediate insight and relief.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-700 bg-neutral-950/40 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">One-line version</p>
          <p className="mt-3 text-slate-300">
            Cam helps founder-led leadership teams get aligned, install real accountability, and execute with more momentum —
            without adding bureaucracy.
          </p>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-2">
        <div className="rounded-2xl border border-neutral-600 bg-neutral-900/85 p-6 shadow-lg shadow-black/30 md:p-7">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">Ready to move this forward?</h2>
              <p className="mt-2 text-slate-300">Book the 90-minute Discovery Meeting. If it’s not a fit, you’ll know quickly.</p>
            </div>
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-6 py-2.5 text-base font-extrabold text-slate-950 transition hover:opacity-90"
            >
              Book 90-min Discovery <ArrowRight size={18} aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
