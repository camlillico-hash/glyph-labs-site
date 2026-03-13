export const metadata = {
  title: "Cam Lillico",
  description:
    "A small corner of the internet for sharp ideas, difficult truths, and life-affirming philosophy.",
};

const dynamicPoints = [
  {
    icon: "◐",
    title: "Metaphysics vs. Method",
    text: "Schopenhauer grounds suffering in the blind striving of the Will. Nietzsche keeps the insight about conflict, but shifts from metaphysical explanation to cultural-psychological method: how values are made, inherited, and transformed.",
  },
  {
    icon: "⚖",
    title: "Compassion vs. Strength",
    text: "Schopenhauer privileges compassion and quieting desire as ethical relief from shared suffering. Nietzsche worries this can harden into life-denial; he argues for disciplined strength that can metabolize pain into growth, form, and responsibility.",
  },
  {
    icon: "↺",
    title: "Denial vs. Transfiguration",
    text: "For Schopenhauer, art offers temporary reprieve and asceticism points beyond willing. Nietzsche radicalizes art into an existential practice: not escape from life, but transfiguration of life through style, rank-ordering, and chosen commitments.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100">
      <div className="h-2 w-full bg-blue-500" aria-hidden />
      <a
        href="/bos360"
        aria-label="Navigate to Glyph Labs"
        title="Glyph Labs"
        className="fixed bottom-3 right-3 z-20 text-[10px] tracking-[0.25em] uppercase text-slate-500/35 transition hover:text-cyan-300/70"
      >
        ◌
      </a>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-24 md:pt-32">
        <p className="inline-flex w-fit max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-300 backdrop-blur sm:gap-2 sm:px-4 sm:text-xs sm:tracking-[0.2em]">
          <span aria-hidden>✶</span> Philosophy • Friction • Forward Motion
        </p>



        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-2xl shadow-black/30">
          <img
            src="/hero-variants/philosophy-hero-v3-cosmic.jpg"
            alt="Abstract philosophical visual: shadow, light, and tension"
            className="h-44 w-full object-cover opacity-90 md:h-64"
            loading="eager"
          />
        </div>
        <h1 className="mt-7 max-w-5xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Between Schopenhauer’s shadow and Nietzsche’s fire.
        </h1>

        <p className="mt-6 max-w-4xl text-lg leading-relaxed text-slate-300">
          This project starts from a hard claim Schopenhauer made unavoidable:
          that desire rarely grants peace, and that suffering is not an exception
          to life but one of its regular conditions. Nietzsche inherits that
          severity, then turns it: if no ready-made meaning can be trusted, then
          meaning becomes a task. Not comfort, not denial — creation under
          pressure.
        </p>
      </section>

      {/* Core contrast cards */}
      <section className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-800/90 bg-slate-900/70 p-8 shadow-2xl shadow-black/25 backdrop-blur">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-100">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-base">
                🌒
              </span>
              Schopenhauer: respect the dark
            </h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Schopenhauer’s rigor is moral and diagnostic. He refuses the easy
              narrative that progress or pleasure solves the human condition. At
              his best, he offers intellectual sobriety: clear seeing without
              anesthesia, compassion without sentimentality.
            </p>
            <p className="mt-4 text-slate-400">
              Not cynical for style — serious for truth.
            </p>
          </article>

          <article className="rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-slate-800/95 to-slate-900/95 p-8 shadow-2xl shadow-cyan-900/20 backdrop-blur">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-100">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 text-base text-cyan-200">
                🔥
              </span>
              Nietzsche: answer with creation
            </h2>
            <p className="mt-4 leading-relaxed text-slate-200">
              Nietzsche agrees that inherited certainties collapse under
              scrutiny. His response is not retreat but authorship: cultivate
              taste, hierarchy, and discipline so one can shape a life worth
              affirming. The point is not painless living, but transformed
              living.
            </p>
            <p className="mt-4 text-slate-300">
              Not naïve optimism — earned affirmation.
            </p>
          </article>
        </div>
      </section>

      {/* Dynamic elaboration */}
      <section className="border-y border-slate-800/80 bg-slate-900/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
            <span aria-hidden className="text-cyan-300">
              ◉
            </span>
            The Schopenhauer–Nietzsche Dynamic
          </h2>
          <p className="mt-4 max-w-4xl text-slate-300">
            Read together, they form a productive tension: Schopenhauer strips
            illusion; Nietzsche prevents lucidity from curdling into paralysis.
            One sharpens the diagnosis, the other reopens agency.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {dynamicPoints.map((point) => (
              <article
                key={point.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 transition hover:-translate-y-0.5 hover:border-cyan-400/30"
              >
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
                  <span aria-hidden className="text-cyan-300">
                    {point.icon}
                  </span>
                  {point.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {point.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <blockquote className="text-xl leading-relaxed text-slate-200 md:text-2xl">
            “To see clearly like Schopenhauer. To live courageously like
            Nietzsche.”
          </blockquote>
          <p className="mt-6 text-slate-400">More essays and notes coming soon.</p>
        </div>
      </section>
    </main>
  );
}
