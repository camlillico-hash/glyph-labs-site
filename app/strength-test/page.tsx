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

const sectionColors: Record<SectionKey, string> = {
  Business: "#D90000",
  Brand: "#FF5700",
  Team: "#E9D019",
  Strategy: "#4A9BB8",
  Execution: "#7DD3FC",
  Culture: "#22C55E",
};

function scoreColor(total: number) {
  if (total <= 50) return "#ef4444";
  if (total <= 84) return "#facc15";
  return "#22c55e";
}

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
    const radius = 86;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return entries.map((section) => {
      const value = subtotals[section];
      const percent = Math.round((value / sectionMax[section]) * 100);
      const length = (value / 100) * circumference;
      const slice = {
        section,
        value,
        percent,
        color: sectionColors[section],
        radius,
        circumference,
        dashArray: `${length} ${Math.max(circumference - length, 0)}`,
        dashOffset: -offset,
      };
      offset += length;
      return slice;
    });
  }, [subtotals]);

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
    return (
      <main className="min-h-screen bg-[#06090f] text-slate-100">
        <section className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h1 className="text-3xl font-bold">Strength Test Results</h1>

            <div className="mt-6 grid gap-6 md:grid-cols-[300px_1fr]">
              <div className="flex flex-col items-center">
                <svg width="260" height="260" viewBox="0 0 260 260" aria-label="Section score donut chart">
                  <g transform="rotate(-90 130 130)">
                    <circle cx="130" cy="130" r="86" fill="none" stroke="#0f172a" strokeWidth="28" />
                    {pieSlices.map((s) => (
                      <circle
                        key={s.section}
                        cx="130"
                        cy="130"
                        r={s.radius}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="28"
                        strokeLinecap="butt"
                        strokeDasharray={s.dashArray}
                        strokeDashoffset={s.dashOffset}
                      />
                    ))}
                  </g>
                  <circle cx="130" cy="130" r="56" fill="#06090f" />
                  <text x="130" y="120" textAnchor="middle" fontSize="12" fill="#94a3b8">Overall Score</text>
                  <text x="130" y="147" textAnchor="middle" fontSize="28" fontWeight="700" fill={totalColor}>{total}%</text>
                </svg>
                <p className="mt-2 text-sm text-slate-400">Section distribution</p>
              </div>

              <div>
                <p className="text-sm text-slate-300">Total Score</p>
                <p className="mt-1 text-5xl font-bold" style={{ color: totalColor }}>
                  {total} / 100
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {total <= 50 ? "At-risk zone" : total <= 84 ? "Developing zone" : "Strong zone"}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {pieSlices.map((s) => (
                    <div key={s.section} className="rounded-lg border border-slate-800 p-3">
                      <p className="text-sm text-slate-300 inline-flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.section}
                      </p>
                      <p className="text-xl font-semibold">
                        {s.value} / {sectionMax[s.section]}
                      </p>
                      <p className="text-xs text-slate-400">{s.percent}% of section max</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 rounded border border-slate-700 px-3 py-2 text-sm hover:border-slate-500"
              onClick={() => {
                setSubmitted(false);
                setIndex(0);
              }}
            >
              Review answers
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100">
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
    </main>
  );
}
