"use client";

import { useMemo, useState } from "react";

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
  };

  const next = () => {
    if (index < questions.length - 1) setIndex((i) => i + 1);
  };

  const back = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  if (!started) {
    return (
      <main className="min-h-screen bg-[#06090f] text-slate-100">
        <section className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10">
          <div className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">Assessment</p>
            <h1 className="mt-2 text-3xl font-bold">How strong is your business?</h1>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Take the Strength Test to quickly identify strengths and growth areas across your organization.
            </p>
            <div className="mx-auto mt-5 max-w-xl space-y-2 text-left text-sm text-slate-300">
              <p>• 20 questions, scored 0–5.</p>
              <p>• Covers 3 Core Pillars: <span className="font-semibold text-slate-100">Business, Brand, Team</span>.</p>
              <p>• Plus 3 Bonding Forces: <span className="font-semibold text-slate-100">Strategy, Execution, Culture</span>.</p>
              <p>• Finish in a few minutes and get an instant score breakdown.</p>
            </div>
            <button
              type="button"
              className="mt-8 rounded bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black"
              onClick={() => setStarted(true)}
            >
              Start Test
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (submitted) {
    const totalColor = scoreColor(total);
    const totalLabel = scoreLabel(total);

    return (
      <main className="min-h-screen bg-[#06090f] text-slate-100">
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
                  <circle cx="140" cy="140" r="56" fill="#06090f" />
                  <text x="140" y="124" textAnchor="middle" fontSize="13" fontWeight="700" fill="#cbd5e1">Your Overall Score</text>
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
                <p className="mt-3 text-slate-400">Results are based on your responses across the six BOS360 dimensions.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {(Object.keys(subtotals) as SectionKey[]).map((section) => {
              const percent = Math.round((subtotals[section] / sectionMax[section]) * 100);
              const color = scoreColor(percent);
              const label = scoreLabel(percent);

              return (
                <article key={section} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <h2 className="text-2xl font-semibold uppercase tracking-wide">{section}</h2>
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
            <p className="mt-2 text-slate-300">Book a discovery meeting and we’ll walk through your results together.</p>
            <a
              href="https://calendar.app.google/M4pokXD8CBpc1c4U6"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black"
            >
              Book a Meeting
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
          © {new Date().getFullYear()} Glyph Labs. All rights reserved.
        </footer>
      </main>
    );
  }

  const completionPct = Math.round((completed / questions.length) * 100);

  return (
    <main className="min-h-screen bg-[#06090f] pb-16 text-slate-100">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Strength Test</p>
            <p className="text-xs text-slate-400">
              {index + 1} / {questions.length}
            </p>
          </div>

          <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">{current.section}</p>
          <h1 className="mt-2 text-xl font-semibold leading-relaxed">
            {current.id}. {current.text}
          </h1>

          <div className="mt-6 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((score) => {
              const active = selected === score;
              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => choose(score)}
                  className={`h-10 w-10 rounded border text-sm ${
                    active
                      ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                      : "border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                  aria-label={`Question ${current.id} score ${score}`}
                >
                  {score}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={index === 0}
              className="rounded border border-slate-700 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
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
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                disabled={completed < questions.length}
                className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                See Results
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-[#06090f]/95 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-cyan-400 transition-all duration-300" style={{ width: `${completionPct}%` }} />
          </div>
          <p className="w-14 text-right text-xs text-slate-300">{completionPct}%</p>
        </div>
      </div>
    </main>
  );
}
