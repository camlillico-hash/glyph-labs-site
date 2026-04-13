"use client";

import { BriefcaseBusiness, Tag, Users, Compass, Cog, Sprout, User, Mail, Download, Sparkles, Layers } from "lucide-react";
import { useMemo, useState } from "react";
import Bos360SiteHeader from "@/app/components/Bos360SiteHeader";


type SectionKey = "Business" | "Brand" | "Team" | "Strategy" | "Execution" | "Culture";

type Question = {
  id: number;
  section: SectionKey;
  text: string;
};

const questions: Question[] = [
  { id: 1, section: "Business", text: "We are profitable and growing and managing cash flow with predictability." },
  { id: 2, section: "Business", text: "Our Scoreboard for tracking weekly metrics is in place." },
  { id: 3, section: "Business", text: "Our Flywheel is clearly defined and everyone understands it." },
  { id: 4, section: "Business", text: "We have a clear Budget and are monitoring it monthly, quarterly and annually." },
  { id: 5, section: "Brand", text: "Our Core Purpose and Brand Promise are well understood both internally and externally." },
  { id: 6, section: "Brand", text: "Our Target Customers are clearly defined, and all of our efforts are focused on them." },
  { id: 7, section: "Brand", text: "Our Core Competence and Differentiators are clear, and we stay focussed on them." },
  { id: 8, section: "Team", text: "All of the people in our organization fit our culture and they are in the right seats." },
  { id: 9, section: "Team", text: "We have an Accountability Chart with everyone’s roles & responsibilities — it is shared and up to date." },
  { id: 10, section: "Team", text: "Everyone in the organization is high-performing and has what they need to do their job well." },
  { id: 11, section: "Strategy", text: "Our Ten Year Mission is in writing and has been shared with everyone in the company." },
  { id: 12, section: "Strategy", text: "We have a Clear 3 Year Vision with revenue and profit targets established." },
  { id: 13, section: "Strategy", text: "We have an Annual Plan with clear goals in writing that is understood by all." },
  { id: 14, section: "Execution", text: "Everyone has 1–5 priorities per quarter and they stay focused on them." },
  { id: 15, section: "Execution", text: "Everyone is engaged in regular weekly meetings with a set agenda — they start and end on time." },
  { id: 16, section: "Execution", text: "All teams clearly identify and prioritize key topics and tackle them effectively." },
  { id: 17, section: "Execution", text: "Our core processes are documented and followed to consistently produce the results we want." },
  { id: 18, section: "Culture", text: "Our core values are clear, and we are hiring, reviewing, rewarding, and firing around them." },
  { id: 19, section: "Culture", text: "The organization cultivates a growth mindset and everyone has a success plan for the year ahead." },
  { id: 20, section: "Culture", text: "Our leadership team is open and honest and demonstrates a high level of trust." },
];

const sectionMax: Record<SectionKey, number> = {
  Business: 20,
  Brand: 15,
  Team: 15,
  Strategy: 15,
  Execution: 20,
  Culture: 15,
};

function scoreColor(total: number) {
  if (total <= 50) return "#e11d48";
  if (total <= 84) return "#f59e0b";
  return "#65a30d";
}

function scoreLabel(total: number) {
  if (total <= 50) return "Weak";
  if (total <= 84) return "Moderate";
  return "Strong";
}

const sectionIcons: Record<SectionKey, any> = {
  Business: BriefcaseBusiness,
  Brand: Tag,
  Team: Users,
  Strategy: Compass,
  Execution: Cog,
  Culture: Sprout,
};

const sectionDescriptions: Record<SectionKey, string> = {
  Business:
    "Strengthening this component means shaping the organization to be predictable and profitable, with a proven flywheel that creates value and consistently generates cash to fuel growth.",
  Brand:
    "Strengthening the brand means ensuring your company is understood and appreciated both internally and externally, with a clear identity brought to life across touchpoints.",
  Team:
    "Beyond having the right people in the right seats, a strong team is happy and high-performing. They work well together and improve individually and collectively over time.",
  Strategy:
    "Strengthening this component means getting everyone 100% aligned with where you are going and how you plan to get there. It provides direction and decision clarity.",
  Execution:
    "This is instilling simplicity, focus, discipline, and accountability throughout the company so everyone executes on vision day after day and momentum compounds.",
  Culture:
    "This is your unique vibe that sets you apart and defines who you are. It is essential for a healthy, high-performing team and sustaining authentic momentum.",
};

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function makeArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export default function StrengthTestPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [leadThanks, setLeadThanks] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState("");
  const [resultSaving, setResultSaving] = useState(false);
  const [resultError, setResultError] = useState("");
  const [leadForm, setLeadForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    website: "", // honeypot
  });

  const current = questions[index];
  const selected = current ? answers[current.id] : undefined;
  const completed = Object.keys(answers).length;

  const subtotals = useMemo(() => {
    const totals: Record<SectionKey, number> = {
      Business: 0,
      Brand: 0,
      Team: 0,
      Strategy: 0,
      Execution: 0,
      Culture: 0,
    };
    for (const q of questions) totals[q.section] += answers[q.id] ?? 0;
    return totals;
  }, [answers]);

  const total = Object.values(subtotals).reduce((a, b) => a + b, 0);

  const pieSlices = useMemo(() => {
    const entries = Object.keys(subtotals) as SectionKey[];
    const radius = 94;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return entries.map((section) => {
      const value = subtotals[section];
      const percent = Math.round((value / sectionMax[section]) * 100);
      const share = total > 0 ? value / total : 0;
      const length = share * circumference;
      const startFraction = total > 0 ? offset / circumference : 0;
      const endFraction = total > 0 ? (offset + length) / circumference : 0;
      const slice = {
        section,
        value,
        percent,
        share,
        color: scoreColor(percent),
        label: scoreLabel(percent),
        radius,
        circumference,
        dashArray: `${length} ${Math.max(circumference - length, 0)}`,
        dashOffset: -offset,
        startFraction,
        endFraction,
      };
      offset += length;
      return slice;
    });
  }, [subtotals, total]);

  const choose = (score: number) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: score }));
    if (index < questions.length - 1) {
      setTimeout(() => setIndex((i) => Math.min(i + 1, questions.length - 1)), 80);
    }
  };

  const next = () => {
    if (index < questions.length - 1) setIndex((i) => i + 1);
  };

  const back = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const submitResults = async () => {
    setResultError("");
    setResultSaving(true);
    try {
      const payload = {
        ...leadForm,
        overallScore: total,
        sectionScores: subtotals,
        answers: questions.map((q) => ({
          questionId: q.id,
          section: q.section,
          questionText: q.text,
          score: answers[q.id] ?? 0,
        })),
      };

      const res = await fetch("/api/strength-test/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save results");
      }
      const data = await res.json().catch(() => ({}));
      setResultPdfUrl(String(data?.pdfUrl || ""));
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save results";
      setResultError(message);
    } finally {
      setResultSaving(false);
    }
  };

  const submitLead = async (e: any) => {
    e.preventDefault();
    setLeadError("");

    if (!leadForm.firstName || !leadForm.lastName || !leadForm.company || !leadForm.email) {
      setLeadError("Please complete all required fields.");
      return;
    }

    setLeadSubmitting(true);
    try {
      const res = await fetch("/api/strength-test/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(leadForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to start test right now.");
      }
      setShowLeadModal(false);
      setStarted(true);
      setLeadThanks(true);
    } catch (err: any) {
      setLeadError(err?.message || "Unable to start test right now.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (!started) {
    return (
      <main className="strength-theme min-h-screen bg-[#06090f] text-slate-100">
        <Bos360SiteHeader current="strength-test" />

        <section className="mx-auto w-full max-w-5xl px-6 py-6 md:py-10">
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/30 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300"><Sparkles size={13} /> Strength Test</p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">Assessing your organization</h1>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Take the <strong className="font-semibold text-slate-100">BOS360™ Strength Test</strong> to identify your organization’s core strengths and growth areas. Unlock your business potential quickly with instant insights into performance — fast, easy, and free.
                </p>

                <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/55 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100"><Layers size={14} className="text-cyan-300" />How it works</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Take a few minutes to answer 20 questions across 3 foundational pillars and their bonding forces. Each question reflects an important aspect of organizational health and helps surface where your business excels and where it needs focus.
                  </p>
                  <p className="mt-3 text-sm text-slate-300">
                    The most successful organizations simultaneously build three Core Pillars: <span className="font-semibold text-slate-100">Business, Brand, Team</span> — by strengthening the Three Bonding Forces: <span className="font-semibold text-slate-100">Strategy, Execution, Culture</span>.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="pillar-card rounded-lg border border-orange-400/45 bg-orange-500/12 px-3 py-2.5 text-sm text-orange-100"><span className="inline-flex items-center gap-1.5 font-semibold"><BriefcaseBusiness size={14} /> BUSINESS:</span> Profitable, growing, managing cash predictably</div>
                  <div className="pillar-card rounded-lg border border-orange-400/45 bg-orange-500/12 px-3 py-2.5 text-sm text-orange-100"><span className="inline-flex items-center gap-1.5 font-semibold"><Tag size={14} /> BRAND:</span> Clear and consistent internally and externally</div>
                  <div className="pillar-card rounded-lg border border-orange-400/45 bg-orange-500/12 px-3 py-2.5 text-sm text-orange-100"><span className="inline-flex items-center gap-1.5 font-semibold"><Users size={14} /> TEAM:</span> Right people in the right seats</div>
                  <div className="pillar-card rounded-lg border border-orange-400/45 bg-orange-500/12 px-3 py-2.5 text-sm text-orange-100"><span className="inline-flex items-center gap-1.5 font-semibold"><Compass size={14} /> STRATEGY:</span> Decisive, aligned and inspired</div>
                  <div className="pillar-card rounded-lg border border-orange-400/45 bg-orange-500/12 px-3 py-2.5 text-sm text-orange-100"><span className="inline-flex items-center gap-1.5 font-semibold"><Cog size={14} /> EXECUTION:</span> Accountability and discipline</div>
                  <div className="pillar-card rounded-lg border border-orange-400/45 bg-orange-500/12 px-3 py-2.5 text-sm text-orange-100"><span className="inline-flex items-center gap-1.5 font-semibold"><Sprout size={14} /> CULTURE:</span> Happy and high performing</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Sample results preview</p>
                  <svg viewBox="0 0 240 240" className="mx-auto mt-2 h-44 w-44" aria-label="Sample donut chart with 6 sections">
                    <circle cx="120" cy="120" r="68" fill="none" stroke="#ffffff" strokeWidth="28" />
                    <circle cx="120" cy="120" r="68" fill="none" stroke="#f97316" strokeWidth="24" strokeDasharray="82 427" strokeDashoffset="0" transform="rotate(-90 120 120)" />
                    <circle cx="120" cy="120" r="68" fill="none" stroke="#38bdf8" strokeWidth="24" strokeDasharray="71 427" strokeDashoffset="-82" transform="rotate(-90 120 120)" />
                    <circle cx="120" cy="120" r="68" fill="none" stroke="#8b5cf6" strokeWidth="24" strokeDasharray="66 427" strokeDashoffset="-153" transform="rotate(-90 120 120)" />
                    <circle cx="120" cy="120" r="68" fill="none" stroke="#eab308" strokeWidth="24" strokeDasharray="74 427" strokeDashoffset="-219" transform="rotate(-90 120 120)" />
                    <circle cx="120" cy="120" r="68" fill="none" stroke="#22c55e" strokeWidth="24" strokeDasharray="62 427" strokeDashoffset="-293" transform="rotate(-90 120 120)" />
                    <circle cx="120" cy="120" r="68" fill="none" stroke="#14b8a6" strokeWidth="24" strokeDasharray="72 427" strokeDashoffset="-355" transform="rotate(-90 120 120)" />
                    <circle cx="120" cy="120" r="42" fill="#ffffff" />
                    <text x="120" y="114" textAnchor="middle" fontSize="10" fill="#334155">Overall</text>
                    <text x="120" y="134" textAnchor="middle" fontSize="22" fontWeight="700" fill="#67e8f9">78%</text>
                  </svg>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" />Business</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" />Brand</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" />Team</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" />Strategy</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />Execution</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-500" />Culture</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full cursor-pointer rounded bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-400"
                  onClick={() => setShowLeadModal(true)}
                >
                  Take the assessment
                </button>

                <div className="inline-flex w-full flex-col items-start gap-1 rounded-xl border border-neutral-700 bg-neutral-900/85 px-3 py-2 text-slate-200">
                  <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                    <User size={11} aria-hidden />
                    <Mail size={11} aria-hidden />
                    Name + email required
                  </span>
                  <span className="text-[11px] leading-snug text-slate-300">
                    Before starting, you’ll be asked to share your contact details so I can send context and follow up on your results.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showLeadModal ? (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-5 text-slate-900 shadow-2xl">
                <p className="text-lg font-semibold">Fill in the information below to get started.</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600">
                  <img
                    src="/cam-headshot-circle.png"
                    alt="Cam Lillico"
                    className="h-6 w-6 rounded-full border border-slate-300 object-cover"
                  />
                  I’ll personally review your submission and follow up by email with context on your results.
                </p>
                <form className="mt-4 space-y-3" onSubmit={submitLead}>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="First name*"
                    value={leadForm.firstName}
                    onChange={(e) => setLeadForm((p) => ({ ...p, firstName: e.target.value }))}
                    required
                  />
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Last name*"
                    value={leadForm.lastName}
                    onChange={(e) => setLeadForm((p) => ({ ...p, lastName: e.target.value }))}
                    required
                  />
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Company*"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm((p) => ({ ...p, company: e.target.value }))}
                    required
                  />
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Email*"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                  <input
                    type="tel"
                    inputMode="tel"
                    pattern="^\+?[0-9()\-\s]{7,20}$"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Phone (optional)"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                  />

                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="hidden"
                    placeholder="Website"
                    value={leadForm.website}
                    onChange={(e) => setLeadForm((p) => ({ ...p, website: e.target.value }))}
                  />

                  {leadError ? <p className="text-sm text-rose-600">{leadError}</p> : null}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
                      onClick={() => setShowLeadModal(false)}
                      disabled={leadSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded bg-cyan-500 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
                      disabled={leadSubmitting}
                    >
                      {leadSubmitting ? "Starting..." : "Start"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </section>
        <footer className="hidden border-t border-slate-800 py-6 text-center text-xs text-slate-400 md:block">
          © {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.
        </footer>
      </main>
    );
  }

  if (submitted) {
    const totalColor = scoreColor(total);
    const totalLabel = scoreLabel(total);

    return (
      <main className="strength-theme min-h-screen bg-[#06090f] text-slate-100">
        <Bos360SiteHeader current="strength-test" />

        <section className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="text-4xl font-semibold leading-tight">Strength Test: Your Results</h1>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
            <p className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 rounded-full bg-rose-600" /> Weak</p>
            <p className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 rounded-full bg-amber-500" /> Moderate</p>
            <p className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 rounded-full bg-lime-600" /> Strong</p>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="grid gap-6 md:grid-cols-[340px_1fr] md:items-start">
              <div className="flex flex-col items-center">
                <svg width="280" height="280" viewBox="0 0 280 280" aria-label="Section score donut chart">
                  <g transform="rotate(-90 140 140)">
                    <circle cx="140" cy="140" r="94" fill="none" stroke="#1e293b" strokeWidth="30" />
                    {pieSlices.map((s) => (
                      <g key={s.section}>
                        <circle
                          cx="140"
                          cy="140"
                          r="94"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="34"
                          strokeLinecap="butt"
                          strokeDasharray={s.dashArray}
                          strokeDashoffset={s.dashOffset}
                        />
                        <circle
                          cx="140"
                          cy="140"
                          r="94"
                          fill="none"
                          stroke={s.color}
                          strokeWidth="28"
                          strokeLinecap="butt"
                          strokeDasharray={s.dashArray}
                          strokeDashoffset={s.dashOffset}
                        />
                      </g>
                    ))}
                  </g>
                  {pieSlices.map((s) => {
                    const angle = s.endFraction * 360;
                    const p1 = polarToCartesian(140, 140, 78, angle);
                    const p2 = polarToCartesian(140, 140, 110, angle);
                    return <line key={`sep-${s.section}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#ffffff" strokeWidth="2" />;
                  })}
                  <circle cx="140" cy="140" r="56" fill="#ffffff" />
                  <text x="140" y="124" textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">Your Overall Score</text>
                  <text x="140" y="166" textAnchor="middle" fontSize="44" fontWeight="700" fill={totalColor}> {total}%</text>
                </svg>

                <div className="mt-4 grid w-full grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-700 pt-3 text-xs">
                  {pieSlices.map((s) => (
                    <div key={s.section} className="flex items-center justify-between gap-2 text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.section}
                      </span>
                      <span className="font-semibold">{s.value}/{sectionMax[s.section]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Overall Rating</p>
                <p className="mt-1 text-4xl font-bold" style={{ color: totalColor }}>{totalLabel}</p>
                <p className="mt-3 text-slate-400">Results are based on your responses across the six BOS360™ dimensions.</p>

                <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-slate-200">
                  Your results have been sent to me. I’ll review them and follow up to discuss potential next steps.
                </div>

                {resultPdfUrl ? (
                  <a
                    href={resultPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-results-btn mt-3 inline-flex items-center gap-1.5 rounded border border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    <Download size={15} aria-hidden />
                    Download my results
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {(Object.keys(subtotals) as SectionKey[]).map((section) => {
              const percent = Math.round((subtotals[section] / sectionMax[section]) * 100);
              const color = scoreColor(percent);
              const label = scoreLabel(percent);
              const Icon = sectionIcons[section];

              return (
                <article key={section} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <h2 className="inline-flex items-center gap-2 text-2xl font-semibold uppercase tracking-wide"><Icon size={20} className="text-cyan-300" aria-hidden />{section}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-slate-300">{sectionDescriptions[section]}</p>
                  <div className="mt-5 text-center">
                    <p className="text-3xl font-bold" style={{ color }}>{percent}%</p>
                    <span className="mt-1 inline-block rounded px-3 py-1 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
                      {label}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-center">
            <p className="text-2xl font-semibold">Ready to strengthen your next 90 days?</p>
            <p className="mt-2 text-slate-300">Book an intro call and we’ll walk through your results together.</p>
            <a
              href="https://calendar.app.google/M4pokXD8CBpc1c4U6"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-all duration-150 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Book an Intro Call
            </a>
          </div>

          <button
            type="button"
            className="mt-6 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:border-slate-500"
            onClick={() => {
              setSubmitted(false);
              setIndex(0);
            }}
          >
            Review answers
          </button>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.
        </footer>
      </main>
    );
  }

  const completionPct = Math.round((completed / questions.length) * 100);

  return (
    <main className="strength-theme h-[100dvh] overflow-hidden bg-[#06090f] text-slate-100">
      <Bos360SiteHeader current="strength-test" />

      <section className="mx-auto flex h-[calc(100dvh-118px)] w-full max-w-3xl items-center px-6 py-4 md:h-auto md:block md:py-10">
        <div className="w-full">
          {leadThanks && index === 0 ? (
            <div className="thanks-bar mb-3 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              Thanks — details received. Let’s run your Strength Test.
            </div>
          ) : null}

          <div className="max-h-full w-full overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Strength Test</p>
            <p className="text-xs text-slate-400">
              {index + 1} / {questions.length}
            </p>
          </div>

          <div className="min-h-[132px]">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">{current.section}</p>
            <h1 className="mt-2 text-xl font-semibold leading-relaxed">
              {current.id}. {current.text}
            </h1>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((score) => {
              const active = selected === score;
              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => choose(score)}
                  className={`h-10 w-10 rounded border text-sm transition-all duration-150 cursor-pointer ${
                    active
                      ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                      : "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white hover:shadow-md hover:shadow-cyan-500/10"
                  }`}
                  aria-label={`Question ${current.id} score ${score}`}
                >
                  {score}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-400">0 = Not in place · 5 = Consistently true</p>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={index === 0}
              className="rounded border border-slate-700 px-3 py-2 text-sm transition-all duration-150 cursor-pointer hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:bg-transparent"
            >
              Back
            </button>

            {index < questions.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={selected === undefined}
                className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            ) : (
              <div className="text-right">
                <button
                  type="button"
                  onClick={submitResults}
                  disabled={completed < questions.length || resultSaving}
                  className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {resultSaving ? "Saving..." : "See Results"}
                </button>
                {resultError ? <p className="mt-2 text-xs text-rose-300">{resultError}</p> : null}
              </div>
            )}
          </div>
          </div>

          <div className="progress-shell mt-3 flex items-center gap-3 rounded-lg border border-slate-800 bg-[#06090f]/80 px-3 py-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-cyan-400 transition-all duration-300" style={{ width: `${completionPct}%` }} />
            </div>
            <p className="w-14 text-right text-xs text-slate-300">{completionPct}%</p>
          </div>
        </div>
      </section>

      <footer className="hidden border-t border-slate-800 py-6 text-center text-xs text-slate-400 md:block">
        © {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.
      </footer>
    </main>
  );
}
