export const metadata = {
  title: "Hazel Bo Bazel | A Tiny Legend",
  description:
    "A love letter webpage celebrating Hazel Bo Bazel, age 2.5 — joy, chaos, and everyday magic.",
};

const moments = [
  {
    title: "Morning Watch Captain",
    text: "She surveys the kingdom from the front door with her fluffy sidekick, milk in hand, priorities sorted.",
    image: "/hazel/hazel-01.jpg",
  },
  {
    title: "Master of Tiny Masterpieces",
    text: "Coloring pages become full creative negotiations: bold lines, unexpected choices, zero artistic fear.",
    image: "/hazel/hazel-02.jpg",
  },
  {
    title: "Smile Department (Dad Edition)",
    text: "This smile has excellent range: from sweet angel to full mischievous CEO in half a second.",
    image: "/hazel/hazel-03.jpg",
  },
  {
    title: "Snow White, But With Better Styling",
    text: "Princess dress. Green hat. Absolute confidence. No notes. Fashion history was made.",
    image: "/hazel/hazel-04.jpg",
  },
  {
    title: "Book Club President",
    text: "She reads, points, narrates, and asks the big questions the adults are not ready for yet.",
    image: "/hazel/hazel-05.jpg",
  },
  {
    title: "Lock Screen Royalty",
    text: "The kind of picture you keep forever because it instantly improves any difficult day by at least 73%.",
    image: "/hazel/hazel-06.jpg",
  },
  {
    title: "Snacktime Superstar",
    text: "Toast on deck, tomatoes on standby, grin at maximum brightness. Michelin-level joy per bite.",
    image: "/hazel/hazel-07.jpg",
  },
  {
    title: "Living Room Race Director",
    text: "Toy car in hand, game face on, big laugh loaded. No race has ever been this adorable.",
    image: "/hazel/hazel-08.jpg",
  },
  {
    title: "Team Crown Night",
    text: "Family crowns, doodles, and dinner-table giggles. The kind of memory that becomes a permanent treasure.",
    image: "/hazel/hazel-09.jpg",
  },
];

export default function HazelBoBazelPage() {
  return (
    <main className="min-h-screen bg-[#fff7ef] text-[#3b2c1f]">
      <a
        href="/"
        aria-label="Navigate home"
        title="Home"
        className="fixed bottom-3 right-3 z-20 text-[10px] tracking-[0.25em] uppercase text-[#8a6d53]/55 transition hover:text-[#a14f2f]"
      >
        ◌
      </a>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 -left-20 h-96 w-96 rounded-full bg-[#ffd9b8]/55 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-[#f7c4d4]/35 blur-3xl" />
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 md:pt-28">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#d9bda1] bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#7d5b45] backdrop-blur">
          <span aria-hidden>✿</span>
          The Hazel Bo Bazel Chronicles · Age 2.5
        </p>

        <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Our precious angel,
          <span className="bg-gradient-to-r from-[#c97149] via-[#a14f2f] to-[#7f3b24] bg-clip-text text-transparent">
            {" "}Hazel Bo Bazel
          </span>
          : tiny human, giant joy.
        </h1>

        <p className="mt-6 max-w-4xl text-lg leading-relaxed text-[#5c4331]">
          This page is a little storybook of Hazel in her current golden era:
          bold outfits, huge smiles, snack-time diplomacy, art studio seriousness,
          and the daily reminder that wonder is a practical skill.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-[#d9bda1] bg-white p-2 shadow-2xl shadow-[#a14f2f]/10">
          <img
            src="/hazel/hazel-06.jpg"
            alt="Hazel smiling brightly in a sun hat"
            className="h-auto w-full rounded-2xl object-contain"
            loading="eager"
          />
        </div>
      </section>

      <section className="border-y border-[#e6d2bf] bg-white/60 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold md:text-4xl">A short legend in nine chapters</h2>
          <p className="mt-3 max-w-3xl text-[#6a4f3b]">
            Each photo is one scene in the ongoing saga: part fairy tale, part comedy,
            all heart.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {moments.map((moment, idx) => (
              <article
                key={moment.title}
                className="group overflow-hidden rounded-2xl border border-[#e3ccba] bg-[#fffaf5] shadow-lg shadow-[#a14f2f]/8 transition hover:-translate-y-1"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={moment.image}
                    alt={moment.title}
                    className="h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    loading={idx < 3 ? "eager" : "lazy"}
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#7d5b45] backdrop-blur">
                    Chapter {idx + 1}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-[#3b2c1f]">{moment.title}</h3>
                  <p className="mt-2 leading-relaxed text-[#654a37]">{moment.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <blockquote className="text-xl leading-relaxed text-[#4e3829] md:text-2xl">
            “If joy had a field guide, Hazel wrote the first edition in crayon.”
          </blockquote>
          <p className="mt-5 text-[#7c614b]">
            Long may the laughter be loud, the outfits be iconic, and the stories keep growing.
          </p>
        </div>
      </section>
    </main>
  );
}
