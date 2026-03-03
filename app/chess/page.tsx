export const metadata = {
  title: "A Very Serious History of Chess | Cam Lillico",
  description:
    "A humorous, self-aware tour of chess history: empires, blunders, and the eternal delusion that knowing the Sicilian makes you a genius.",
};

const timeline = [
  {
    era: "~6th century",
    title: "Chaturanga (India)",
    text: "Chess starts as Chaturanga: war, hierarchy, and slow inevitability. Basically strategy cosplay with elephants.",
  },
  {
    era: "~7th–10th century",
    title: "Shatranj (Persia → Arab world)",
    text: "The game spreads, names evolve, and players already start acting like everyone else is tactically illiterate.",
  },
  {
    era: "~15th century",
    title: "Europe powers up the pieces",
    text: "The queen gets supercharged, bishops gain range, and chess becomes faster and far less forgiving. Medieval patch notes were brutal.",
  },
  {
    era: "19th century",
    title: "Modern tournament era",
    text: "Clocks, formal events, and opening theory explode. Humanity discovers new ways to lose in 25 moves while feeling intellectually superior.",
  },
  {
    era: "20th century",
    title: "World champions, cold wars, ego wars",
    text: "From Capablanca to Kasparov: beautiful games, steel nerves, and press conferences where everyone was definitely very normal.",
  },
  {
    era: "1997 → now",
    title: "Computers arrive, humility does not",
    text: "Deep Blue shocks the world, engines become godlike, and humans keep saying, 'I almost found that move.'",
  },
];

const funFacts = [
  "There are more possible chess games than atoms in the observable universe. So yes, your London setup is still not 'solved.'",
  "'Checkmate' comes from Persian: shah mat — roughly 'the king is helpless.' A timeless mood.",
  "The longest theoretically possible game exceeds 5,000 moves. Your blitz opponent still wants a rematch after hanging a queen on move 9.",
  "Grandmasters still blunder. The difference is they blunder with incredible confidence.",
];

const pretentiousTruths = [
  "Playing chess does not automatically make someone smart. It mostly proves they tolerate suffering in 64 squares.",
  "Memorizing 18 moves of theory is not wisdom. It's a very specific survival skill.",
  "Saying 'it's just calculation' right before blundering a rook is a sacred chess tradition.",
];

export default function ChessPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <a
        href="/"
        aria-label="Navigate home"
        title="Home"
        className="fixed bottom-3 right-3 z-20 text-[10px] tracking-[0.25em] uppercase text-white/25 transition hover:text-[#036734]"
      >
        ◌
      </a>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#036734]/20 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-24 md:pt-32">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur">
            <span aria-hidden>♟</span>
            Interactive-ish museum energy
          </span>
          <span className="inline-flex items-center rounded-full border border-[#036734]/40 bg-[#036734]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
            Pretension level: high
          </span>
        </div>

        <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          A museum-style history of chess,
          <span className="bg-gradient-to-r from-emerald-200 via-[#036734] to-emerald-600 bg-clip-text text-transparent">
            {" "}for people who blunder with confidence
          </span>
          .
        </h1>

        <p className="mt-6 max-w-4xl text-lg text-white/75">
          Chess is one of humanity&apos;s oldest thinking games, and also one of our best
          machines for turning normal adults into self-declared strategic masterminds
          after one decent tactic.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/20 bg-[#0d0d0d] shadow-2xl shadow-black/40">
          <div className="relative">
            <img
              src="/chess-never-give-up.jpg"
              alt="Humorous chess meme saying never give up, with a pawn casting a queen shadow"
              className="h-[320px] w-full object-cover md:h-[420px]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
              <p className="max-w-2xl rounded-lg border border-white/20 bg-black/45 px-3 py-2 text-sm text-white/90 backdrop-blur">
                Exhibit A: the pawn that believes in itself so hard it casts a queen-shaped shadow.
              </p>
              <span className="rounded-full border border-[#036734]/45 bg-[#036734]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-100">
                museum artifact: delusional confidence
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticker strip */}
      <section className="border-y border-white/15 bg-white/5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 text-xs uppercase tracking-[0.2em] text-white/70">
          <span className="rounded-full border border-white/20 px-3 py-1">Kings</span>
          <span className="rounded-full border border-white/20 px-3 py-1">Queens</span>
          <span className="rounded-full border border-white/20 px-3 py-1">Ego</span>
          <span className="rounded-full border border-[#036734]/35 bg-[#036734]/10 px-3 py-1 text-emerald-100">Blunders</span>
          <span className="rounded-full border border-white/20 px-3 py-1">Time trouble</span>
          <span className="rounded-full border border-white/20 px-3 py-1">"I saw that"</span>
        </div>
      </section>

      {/* Timeline cards */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <span aria-hidden className="text-[#036734]">✦</span>
          Timeline: from empires to engines
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {timeline.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/15 bg-[#101010] p-6 shadow-xl shadow-black/40 transition hover:-translate-y-1 hover:border-[#036734]/45"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {item.era}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-white/70">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Split content */}
      <section className="border-y border-white/15 bg-[#0b0b0b] py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <article className="rounded-2xl border border-white/15 bg-[#121212] p-6">
            <h2 className="text-2xl font-bold text-white">Fun facts</h2>
            <ul className="mt-4 space-y-3 text-white/75">
              {funFacts.map((fact) => (
                <li key={fact} className="flex gap-3">
                  <span className="mt-1 text-[#036734]">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/15 bg-[#121212] p-6">
            <h2 className="text-2xl font-bold text-white">Pretentious truths</h2>
            <ul className="mt-4 space-y-3 text-white/75">
              {pretentiousTruths.map((truth) => (
                <li key={truth} className="flex gap-3">
                  <span className="mt-1 text-[#036734]">•</span>
                  <span>{truth}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* CTA-like footer block */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <blockquote className="text-xl leading-relaxed text-white md:text-2xl">
            “Chess does not prove you&apos;re a genius. It proves you can sit still,
            stare into chaos, and occasionally miss mate in one.”
          </blockquote>
          <p className="mt-5 text-white/55">
            Respect the game. Laugh at the culture. Blunder with dignity.
          </p>
          <a
            href="https://www.chess.com/lessons"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex rounded-xl border border-[#036734]/40 bg-gradient-to-r from-emerald-300 via-[#036734] to-emerald-500 px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Get slightly less terrible at chess
          </a>
        </div>
      </section>
    </main>
  );
}
