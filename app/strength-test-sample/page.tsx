import { BriefcaseBusiness, Tag, Users, Compass, Cog, Sprout, Download } from "lucide-react";

type SectionKey = "Business" | "Brand" | "Team" | "Strategy" | "Execution" | "Culture";

const sectionMax: Record<SectionKey, number> = {
  Business: 20,
  Brand: 15,
  Team: 15,
  Strategy: 15,
  Execution: 20,
  Culture: 15,
};

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

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function StrengthTestSamplePage() {
  // random-ish but realistic sample values
  const subtotals: Record<SectionKey, number> = {
    Business: 18,  // 90% strong
    Brand: 6,      // 40% weak
    Team: 11,      // 73% moderate
    Strategy: 7,   // 47% weak
    Execution: 14, // 70% moderate
    Culture: 14,   // 93% strong
  };

  const total = Object.values(subtotals).reduce((a, b) => a + b, 0);

  const entries = Object.keys(subtotals) as SectionKey[];
  const radius = 94;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const slices = entries.map((section) => {
    const value = subtotals[section];
    const percent = Math.round((value / sectionMax[section]) * 100);
    const share = total > 0 ? value / total : 0;
    const length = share * circumference;
    const color = scoreColor(percent);
    const startFraction = total > 0 ? offset / circumference : 0;
    const endFraction = total > 0 ? (offset + length) / circumference : 0;
    const slice = {
      section,
      value,
      percent,
      label: scoreLabel(percent),
      color,
      dashArray: `${length} ${Math.max(circumference - length, 0)}`,
      dashOffset: -offset,
      startFraction,
      endFraction,
    };
    offset += length;
    return slice;
  });

  const totalColor = scoreColor(total);
  const totalLabel = scoreLabel(total);

  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100">
      <header className="z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div className="inline-flex min-w-0 items-center gap-2" aria-label="Cam Lillico Business Coaching">
            <a href="/coaching" className="inline-flex items-center" aria-label="Cam Lillico Coaching home">
              <img src="/logos/glyphlabs-coaching-mark.png" alt="Coaching mark" className="h-8 w-8 object-contain" />
            </a>
            <span className="max-w-[170px] truncate rounded-full border border-neutral-600 bg-neutral-800/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-200 sm:max-w-none sm:px-3 sm:text-[11px] sm:tracking-widest">
              Cam Lillico Business Coaching
            </span>
          </div>
          <a
            href="https://calendar.app.google/M4pokXD8CBpc1c4U6"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-3 py-2 text-xs font-semibold text-slate-950"
          >
            Book an Intro Call
          </a>
        </div>
      </header>

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
                  {slices.map((s) => (
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
                {slices.map((s) => {
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
                {slices.map((s) => (
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
                Your results have been sent to Cam. He’ll review them and follow up to discuss potential next steps.
              </div>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded border border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-200">
                <Download size={15} aria-hidden />
                Download my results
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {entries.map((section) => {
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
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.
      </footer>
    </main>
  );
}
