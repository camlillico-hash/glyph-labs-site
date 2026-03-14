type SectionKey = "Business" | "Brand" | "Team" | "Strategy" | "Execution" | "Culture";

const sectionMax: Record<SectionKey, number> = {
  Business: 20,
  Brand: 15,
  Team: 15,
  Strategy: 15,
  Execution: 20,
  Culture: 15,
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

export default function StrengthTestSamplePage() {
  // random-ish but realistic sample values
  const subtotals: Record<SectionKey, number> = {
    Business: 18,  // 90% strong
    Brand: 6,      // 40% weak
    Team: 13,      // 87% strong
    Strategy: 7,   // 47% weak
    Execution: 10, // 50% weak
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
    const slice = {
      section,
      value,
      percent,
      label: scoreLabel(percent),
      color,
      dashArray: `${length} ${Math.max(circumference - length, 0)}`,
      dashOffset: -offset,
    };
    offset += length;
    return slice;
  });

  const totalColor = scoreColor(total);
  const totalLabel = scoreLabel(total);

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <div className="bg-[#ef7d2d] px-6 py-6 text-center">
        <p className="text-3xl italic tracking-wide text-white">accelerate your growth, simplify your life</p>
      </div>

      <section className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-4xl font-semibold leading-tight">Thank you for taking the <span className="font-bold">Strength Test</span></h1>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
          <p className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 rounded-full bg-rose-600" /> Weak</p>
          <p className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 rounded-full bg-amber-500" /> Moderate</p>
          <p className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 rounded-full bg-lime-600" /> Strong</p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[340px_1fr] md:items-start">
            <div className="flex flex-col items-center">
              <svg width="280" height="280" viewBox="0 0 280 280" aria-label="Section score donut chart">
                <g transform="rotate(-90 140 140)">
                  <circle cx="140" cy="140" r="94" fill="none" stroke="#f1f5f9" strokeWidth="30" />
                  {slices.map((s) => (
                    <circle
                      key={s.section}
                      cx="140"
                      cy="140"
                      r="94"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="30"
                      strokeLinecap="round"
                      strokeDasharray={s.dashArray}
                      strokeDashoffset={s.dashOffset}
                    />
                  ))}
                </g>
                <circle cx="140" cy="140" r="56" fill="white" />
                <text x="140" y="126" textAnchor="middle" fontSize="13" fill="#64748b">Your Overall Score</text>
                <text x="140" y="160" textAnchor="middle" fontSize="44" fontWeight="700" fill={totalColor}>{total}%</text>
              </svg>

              <div className="mt-4 grid w-full grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-200 pt-3 text-xs">
                {slices.map((s) => (
                  <div key={s.section} className="flex items-center justify-between gap-2 text-slate-700">
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
              <p className="mt-3 text-slate-600">Results are based on your responses across the six BOS360 dimensions.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {entries.map((section) => {
            const percent = Math.round((subtotals[section] / sectionMax[section]) * 100);
            const color = scoreColor(percent);
            const label = scoreLabel(percent);

            return (
              <article key={section} className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-semibold uppercase tracking-wide">{section}</h2>
                <p className="mt-3 text-lg leading-relaxed text-slate-700">{sectionDescriptions[section]}</p>
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
      </section>
    </main>
  );
}
