export const metadata = {
  title: "Catchacoma Weekend | The Fellas",
};

const fellas = ["Bird", "O'Reilly", "Pete", "Andrew"];

export default function FellasPage() {
  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
          ❄️ Water-access-only winter run
        </p>

        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
          Catchacoma Lake Weekend with the Fellas
        </h1>

        <p className="mt-5 max-w-3xl text-lg text-slate-300">
          Mid-winter mission: cross-country skied across the lake to get up to the place.
          No road in, just snow, gear, and commitment.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {fellas.map((name) => (
            <span
              key={name}
              className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-100"
            >
              {name}
            </span>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900 shadow-xl shadow-black/30">
          <img
            src="/catchacoma-fellas.jpg"
            alt="Cross-country ski arrival at the cabin on Catchacoma Lake"
            className="w-full object-cover"
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900">
            <img src="/catchacoma-ski-1.jpg" alt="Ski approach across frozen Catchacoma Lake" className="h-full w-full object-cover" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900">
            <img src="/catchacoma-ski-2.jpg" alt="Fellas pulling gear on the lake" className="h-full w-full object-cover" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900">
            <img src="/catchacoma-ski-3.jpg" alt="Final stretch ski tracks to the cabin" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <h2 className="text-xl font-semibold text-amber-200">Field note: The Gus Incident</h2>
          <p className="mt-2 text-slate-300">
            Gus the dog chose violence and dropped one right by O’Reilly’s car.
            O’Reilly then stepped in it... and somehow kept stepping in it before realizing what happened.
            Absolutely gross. Absolutely unforgettable.
          </p>
        </div>

        <p className="mt-6 text-slate-400">
          The kind of weekend that reminds you: the best stories usually start where the easy route ends.
        </p>
      </section>
    </main>
  );
}
