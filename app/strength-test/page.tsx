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

export default function StrengthTestPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

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

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#06090f] text-slate-100">
        <section className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h1 className="text-3xl font-bold">Strength Test Results</h1>
            <p className="mt-3 text-slate-300">Your current baseline score is:</p>
            <p className="mt-2 text-5xl font-bold text-cyan-300">{total} / 100</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(Object.keys(subtotals) as SectionKey[]).map((section) => (
                <div key={section} className="rounded-lg border border-slate-800 p-3">
                  <p className="text-sm text-slate-300">{section}</p>
                  <p className="text-xl font-semibold">
                    {subtotals[section]} / {sectionMax[section]}
                  </p>
                </div>
              ))}
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
            <p className="text-xs text-slate-400">{index + 1} / {questions.length}</p>
          </div>

          <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">{current.section}</p>
          <h1 className="mt-2 text-xl font-semibold leading-relaxed">{current.id}. {current.text}</h1>

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
