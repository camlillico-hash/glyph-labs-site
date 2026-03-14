import {
  BadgeCheck,
  BookOpen,
  Compass,
  Gauge,
  Gem,
  Home,
  Layers,
  Star,
  Workflow,
  ArrowRight,
  User,
  Mail,
} from "lucide-react";
import CopyEmailButton from "./CopyEmailButton";
import { blogPosts } from "./blogPosts";

export const metadata = {
  title: "Coaching",
  robots: { index: false, follow: false },
};

const pillars = [
  {
    Icon: Compass,
    title: "Strategic Clarity",
    text: "Get your leadership team aligned on where you’re going, what matters most now, and what to deprioritize.",
  },
  {
    Icon: Workflow,
    title: "Execution Discipline",
    text: "Turn strategy into focused weekly execution with practical operating rhythms your team can actually sustain.",
  },
  {
    Icon: Gauge,
    title: "Leadership Accountability",
    text: "Build a high-performance culture where ownership is clear, progress is measurable, and momentum compounds.",
  },
];

const process = [
  {
    title: "Warm Intro Conversation",
    text: "A focused intro call to confirm fit, context, and whether your leadership team is ready for disciplined implementation.",
  },
  {
    title: "Free 90-Min Discovery",
    text: "A structured session with your leadership team to diagnose friction points, alignment gaps, and execution bottlenecks.",
  },
  {
    title: "Launch Phase (One-Time, 3 Days)",
    text: "An intensive foundational build to install clarity, accountability, and operating structure your team can actually run.",
  },
  {
    title: "Annual Rhythm",
    text: "5-session cadence: one 2-day Annual plus three single-day Quarterlies to keep priorities clear and execution compounding.",
  },
];

const reads = [
  {
    title: "Traction",
    author: "Gino Wickman",
    rating: "4.1 Goodreads",
    cover: "https://covers.openlibrary.org/b/isbn/1936661837-L.jpg",
  },
  {
    title: "Scaling Up",
    author: "Verne Harnish",
    rating: "4.2 Goodreads",
    cover: "https://covers.openlibrary.org/b/isbn/0986019526-L.jpg",
  },
  {
    title: "Superabound",
    author: "Aquin & Haas",
    rating: "4.9/5 Amazon",
    cover: "/books/superabound.jpg",
  },
  {
    title: "The Science of Scaling",
    author: "Dr. Benjamin Hardy",
    rating: "4.3 Goodreads",
    cover: "/books/science-of-scaling.jpg",
  },
  {
    title: "The Five Dysfunctions of a Team",
    author: "Patrick Lencioni",
    rating: "4.1 Goodreads",
    cover: "https://covers.openlibrary.org/b/isbn/0787960756-L.jpg",
  },
];

export default function Bos360Page() {
  return (
    <main className="min-h-screen bg-neutral-950 text-slate-100">
      <a
        href="/"
        aria-label="Navigate to philosophy page"
        title="Philosophy"
        className="fixed bottom-3 right-3 z-20 text-[10px] tracking-[0.25em] uppercase text-slate-500/35 transition hover:text-[#ed7d31]/80"
      >
        <Home size={12} />
      </a>

      {/* Background glow accents */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#ed7d31]/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-neutral-600/20 blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <a href="/coaching" className="inline-flex items-center" aria-label="Glyph Labs Coaching">
            <img src="/logos/glyphlabs-coaching-mark.png" alt="Glyph Labs mark" className="h-8 w-8 object-contain" />
          </a>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <a href="/strength-test" className="rounded-lg border border-cyan-400/50 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10">
              Start Strength Test
            </a>
            <a
              href="https://calendar.app.google/M4pokXD8CBpc1c4U6"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-3 py-2 text-xs font-semibold text-slate-950"
            >
              Book a Discovery Call
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-16 md:pb-10 md:pt-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-neutral-600 bg-neutral-800/85 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-orange-200">
          <BadgeCheck size={14} aria-hidden />
          Glyph Labs Business Coaching
        </p>

        <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Build a leadership team that executes with clarity, discipline, and momentum.
        </h1>

        <div className="mt-6 flex max-w-4xl items-center gap-4 md:gap-5">
          <img
            src="/cam-headshot-circle.png"
            alt="Cam Lillico headshot"
            className="h-16 w-16 shrink-0 rounded-full border border-neutral-600 object-cover shadow-lg shadow-black/40 md:h-20 md:w-20"
            loading="eager"
          />
          <p className="text-lg text-slate-300">
            I help growth-stage founders and leadership teams install a practical operating cadence so priorities are clear,
            accountability is real, and execution improves week by week.
          </p>
        </div>

      </section>

      {/* STRENGTH TEST CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <div className="rounded-2xl border border-neutral-600 bg-neutral-900/85 p-6 shadow-lg shadow-black/30 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Free Diagnostic</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">Take the Strength Test before we talk.</h2>
          <p className="mt-3 max-w-4xl text-slate-300">
            In 3–5 minutes, you’ll get a clear baseline across Business, Brand, Team, Strategy, Execution, and Culture.
            It helps us focus your discovery call on the real bottlenecks instead of surface symptoms.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="/strength-test"
              className="w-[260px] rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-500 to-blue-600 px-5 py-2.5 text-center text-slate-950 transition hover:opacity-90"
            >
              <span className="block text-base font-extrabold">Start the Strength Test</span>
              <span className="mt-1 inline-flex items-center justify-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-slate-200">
                <User size={10} aria-hidden />
                <Mail size={10} aria-hidden />
                Name + email required
              </span>
            </a>
            <span className="inline-flex w-[260px] items-center justify-center whitespace-nowrap rounded-xl border border-neutral-600 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">
              20 questions · instant results
            </span>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <Compass size={22} aria-hidden className="text-[#ed7d31]" />
          What I Help You Solve
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {pillars.map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border border-neutral-600 bg-neutral-900/80 p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-neutral-500"
            >
              <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
                <item.Icon size={18} aria-hidden className="text-[#ed7d31]" />
                {item.title}
              </h3>
              <p className="mt-3 text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FIT */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <h3 className="text-xl font-bold text-orange-200">Who this is for</h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li>• Founder-led or growth-stage companies (roughly $2M–$50M).</li>
              <li>• Leadership teams with strong intent but inconsistent execution.</li>
              <li>• Teams ready for candid conversations and real accountability.</li>
              <li>• Companies that want operating discipline without bureaucracy.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <h3 className="text-xl font-bold text-slate-100">Who this is not for</h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li>• Teams looking for motivation without implementation.</li>
              <li>• Organizations unwilling to commit to weekly/quarterly cadence.</li>
              <li>• Founders wanting outsourced decision-making instead of alignment.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-y border-neutral-700 bg-neutral-900/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
            <Workflow size={22} aria-hidden className="text-[#ed7d31]" />
            My BOS360 Coaching Approach
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {process.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-neutral-700 bg-neutral-900 p-5"
              >
                <p className="text-sm font-semibold uppercase tracking-wider text-orange-300">
                  Step {i + 1}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-100 md:text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 max-w-4xl rounded-2xl border border-neutral-600 bg-neutral-900/85 p-5 shadow-lg shadow-black/30">
            <p className="text-base font-medium leading-relaxed text-slate-100 md:text-lg">
              <Layers size={16} className="mr-2 inline text-[#ed7d31]" />
              BOS360 is a practical operating system for leadership teams who want
              <span className="font-semibold text-orange-200"> traction</span>
              <span className="text-slate-400"> — not </span>
              <span className="font-semibold text-orange-200">theory</span>.
            </p>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section id="proof" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <Star size={22} aria-hidden className="text-[#ed7d31]" />
          Why Founders Work With Me
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <p className="text-4xl font-bold text-[#ed7d31]">20+ Years</p>
            <p className="mt-2 text-slate-300">Business and leadership experience</p>
          </div>
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <p className="text-2xl font-bold text-[#ed7d31]">B2B SaaS Focus</p>
            <p className="mt-2 text-slate-300">
              Specialized in growth-stage startups from $2M to $50M
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6">
            <p className="text-2xl font-bold text-[#ed7d31]">BOS360 Framework</p>
            <p className="mt-2 text-slate-300">
              Proven methodology built around alignment, discipline, and accountability
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <blockquote className="rounded-2xl border border-neutral-600 bg-neutral-900/85 p-6 italic text-slate-100">
“Within one quarter, our team moved from reactive meetings to clear weekly priorities and cleaner ownership. Cam helped us install a cadence we could actually sustain.”
            <div className="mt-4 space-y-3 not-italic">
              <div className="inline-flex h-14 w-40 items-center justify-center rounded-xl border border-white/15 bg-white px-4 py-2 shadow-lg shadow-black/25 ring-1 ring-neutral-500/25">
                <img
                  src="/logos/kira-talent.png"
                  alt="Kira Talent logo"
                  className="h-5 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <span className="block font-semibold text-orange-200">
                — Emilie Cushman, CEO at Kira Talent
              </span>
            </div>
          </blockquote>

          <blockquote className="rounded-2xl border border-neutral-600 bg-neutral-900/85 p-6 italic text-slate-100">
“Cam balanced strategy with accountability. He challenged assumptions, clarified ownership, and helped us move from busy activity to focused execution.”
            <div className="mt-4 space-y-3 not-italic">
              <div className="inline-flex h-14 w-40 items-center justify-center rounded-xl border border-white/15 bg-white px-4 py-2 shadow-lg shadow-black/25 ring-1 ring-neutral-500/25">
                <img
                  src="/logos/ctc-communications.png"
                  alt="CTC Communications logo"
                  className="h-4 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <span className="block font-semibold text-orange-200">
                — Brennan Smith, CEO at CTC Communications
              </span>
            </div>
          </blockquote>

          <blockquote className="rounded-2xl border border-neutral-600 bg-neutral-900/85 p-6 italic text-slate-100">
“Cam brought structure without bureaucracy. We left each session with clear decisions, named owners, and measurable momentum at the stage we needed it most.”
            <div className="mt-4 space-y-3 not-italic">
              <div className="inline-flex h-14 w-40 items-center justify-center rounded-xl border border-white/15 bg-white px-4 py-2 shadow-lg shadow-black/25 ring-1 ring-neutral-500/25">
                <img
                  src="/logos/autohost.png"
                  alt="Autohost logo"
                  className="h-5 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <span className="block font-semibold text-orange-200">
                — Roy Firestein, CEO at Autohost
              </span>
            </div>
          </blockquote>

          <blockquote className="rounded-2xl border border-neutral-600 bg-neutral-900/85 p-6 italic text-slate-100">
            “Cam leads with humility and creates the kind of environment where leadership teams can have open, honest conversations without defensiveness. He facilitates with clarity, asks sharp questions, and helps teams turn insight into real execution.”
            <div className="mt-4 space-y-3 not-italic">
              <div className="inline-flex h-14 w-40 items-center justify-center rounded-xl border border-white/15 bg-white px-4 py-2 shadow-lg shadow-black/25 ring-1 ring-neutral-500/25">
                <img
                  src="/logos/nav360.png"
                  alt="NAV360 logo"
                  className="h-5 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <span className="block font-semibold text-orange-200">
                — Shelby Hacala, Owner at NAV360; BOS360 Coach
              </span>
            </div>
          </blockquote>
        </div>
      </section>

      {/* ABOUT + CTA */}
      <section className="border-t border-neutral-700 bg-neutral-900/40 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
              <img
                src="/cam-headshot-circle.png"
                alt="Cam Lillico"
                className="h-10 w-10 rounded-full border border-neutral-600 object-cover"
                loading="lazy"
              />
              <span className="inline-flex items-center gap-2">
                About Cam Lillico
                <a
                  href="https://www.linkedin.com/in/cameron-lillico/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                  aria-label="Cam Lillico on LinkedIn"
                >
                  <img src="https://cdn-icons-png.flaticon.com/512/2496/2496097.png" alt="LinkedIn" className="h-5 w-5" />
                </a>
              </span>
            </h2>
            <div className="mt-5 space-y-4 text-slate-300">
              <p>
                Cam is a certified BOS360 facilitator and seasoned revenue leader who helps
                CEOs and leadership teams turn vision into disciplined execution. With nearly
                a decade of hands-on experience running annual and quarterly planning sessions,
                he combines structured frameworks with calm, unbiased facilitation to drive
                clarity, accountability, and momentum.
              </p>
              <p>
                Cam doesn’t act as a consultant telling teams what to do — he creates the
                space for honest dialogue, healthy debate, and aligned decision-making. His
                focus is simple: build strong teams, sharpen strategy, and ensure execution
                matches ambition.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <a
                href="https://bos360.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#ed7d31]/45 bg-[#ed7d31]/12 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:bg-[#ed7d31]/20"
              >
                <img src="/badge-bos360.jpg" alt="BOS360" className="h-8 w-8 rounded object-cover" />
                Certified Coach
              </a>
              <a
                href="https://innovationcluster.ca/programs/mentors-advisors"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#ed7d31]/45 bg-[#ed7d31]/12 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:bg-[#ed7d31]/20"
              >
                <img src="/badge-innovation-cluster.jpg" alt="Innovation Cluster" className="h-8 w-8 rounded object-cover" />
                Expert in Residence
              </a>
              <a
                href="https://www.eosworldwide.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#ed7d31]/45 bg-[#ed7d31]/12 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:bg-[#ed7d31]/20"
              >
                <img src="/badge-eos.jpg" alt="EOS" className="h-8 w-8 rounded object-cover" />
                EOS expert past 6 years
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-8">
            <h3 className="flex items-center gap-2 text-2xl font-semibold">
              <ArrowRight size={18} aria-hidden className="text-[#ed7d31]" />
              Ready to Scale with More Clarity?
            </h3>
            <a
              href="/strength-test"
              className="mt-4 inline-flex rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/15"
            >
              Start the Strength Test
            </a>
            <p className="mt-3 text-slate-300">
              Let’s talk about your current stage, your next growth targets, and the
              operating cadence to get you there.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://calendar.app.google/M4pokXD8CBpc1c4U6"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:opacity-90"
              >
                Book a Discovery Call
              </a>
              <CopyEmailButton email="cam@camlillico.com" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <BookOpen size={22} aria-hidden className="text-[#ed7d31]" />
          Recommended reads
        </h2>
        <p className="mt-3 max-w-4xl text-slate-300">
          These are frameworks and operating-system books I regularly pull from in planning, leadership alignment,
          and execution coaching. Great prep if you want to get the most out of a coaching engagement.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {reads.map((book) => (
            <article key={book.title} className="rounded-2xl border border-neutral-700 bg-neutral-900 p-4">
              <img
                src={book.cover}
                alt={`${book.title} cover`}
                className="h-52 w-full rounded-lg border border-neutral-700 object-cover bg-neutral-950"
                loading="lazy"
              />
              <h3 className="mt-3 text-sm font-semibold text-slate-100">{book.title}</h3>
              <p className="mt-1 text-xs text-slate-300">{book.author}</p>
              <p className="mt-2 text-xs font-semibold text-orange-200">{book.rating}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-700 bg-neutral-900/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
            <Gem size={22} aria-hidden className="text-[#ed7d31]" />
            Glyph Coaching
          </h2>
          <p className="mt-3 max-w-4xl text-slate-300">
            Short, practical notes on management, strategy, execution, leadership, and communication.
          </p>

          <div className="mt-8 space-y-4">
            {blogPosts.map((post) => (
              <a
                key={post.slug}
                href={`/coaching/blog/${post.slug}`}
                className="group flex flex-col gap-4 rounded-2xl border border-neutral-700 bg-neutral-900 p-4 transition hover:border-neutral-500 md:flex-row md:items-center"
              >
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="h-36 w-full rounded-xl border border-neutral-700 object-cover md:h-24 md:w-44"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200/90">
                    {post.category} · {post.readTime}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Published {post.publishedAt} · By {post.publishedBy || "Cam Lillico"}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-100 transition group-hover:text-orange-100">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">{post.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Glyph Labs. All rights reserved.
      </footer>
    </main>
  );
}
