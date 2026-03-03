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
    <main className="min-h-screen bg-neutral-950 text-slate-100">
      <a
        href="/"
        aria-label="Navigate home"
        title="Home"
        className="fixed bottom-3 right-3 z-20 text-[10px] tracking-[0.25em] uppercase text-slate-500/35 transition hover:text-[#ed7d31]/80"
      >
        ◌
      </a>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#ed7d31]/20 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-neutral-600/20 blur-3xl" />
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-24 md:pb-10 md:pt-32">
        <p className="inline-flex items-center gap-2 rounded-full border border-neutral-600 bg-neutral-800/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-orange-200">
          <span aria-hidden>♟</span>
          Chess History (With Appropriate Self-Mockery)
        </p>

        <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          The history of chess: a glorious timeline of brilliance,
          <span className="bg-gradient-to-r from-orange-200 via-[#ed7d31] to-orange-600 bg-clip-text text-transparent">
            {" "}blunders, and strategic ego
          </span>
          .
        </h1>

        <p className="mt-6 max-w-4xl text-lg text-slate-300">
          Chess is one of humanity's oldest thinking games, and also one of our
          best machines for turning normal people into confident philosophers after
          three decent tactics puzzles.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <span aria-hidden className="text-[#ed7d31]">✦</span>
          Timeline: from kings to keyboards
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {timeline.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-neutral-700 bg-neutral-900/85 p-6 shadow-xl shadow-black/20"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">
                {item.era}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-100">{item.title}</h3>
              <p className="mt-3 text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-700 bg-neutral-900/40 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <article className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <h2 className="text-2xl font-bold text-slate-100">Fun facts</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              {funFacts.map((fact) => (
                <li key={fact} className="flex gap-3">
                  <span className="mt-1 text-[#ed7d31]">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <h2 className="text-2xl font-bold text-slate-100">Pretentious truths</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              {pretentiousTruths.map((truth) => (
                <li key={truth} className="flex gap-3">
                  <span className="mt-1 text-[#ed7d31]">•</span>
                  <span>{truth}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <blockquote className="text-xl leading-relaxed text-slate-200 md:text-2xl">
            “Chess does not prove you're a genius. It proves you can sit still,
            stare into chaos, and occasionally miss mate in one.”
          </blockquote>
          <p className="mt-5 text-slate-400">
            Respect the game. Laugh at the culture. Blunder with dignity.
          </p>
        </div>
      </section>
    </main>
  );
}
