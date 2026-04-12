import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Crosshair,
  Layers3,
  Mail,
  MoveRight,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Workflow,
  XCircle,
} from "lucide-react";
import { blogPosts } from "../coaching/blogPosts";

export const metadata = {
  title: "Cam Lillico | BOS360 Coaching",
};

const BOOKING_URL = "https://calendar.app.google/M4pokXD8CBpc1c4U6";
const STRENGTH_TEST_URL = "/strength-test";
const BLOG_URL = "/coaching/blog";

const trustItems = [
  "Certified BOS360 Coach",
  "Operator experience in growth-stage B2B SaaS",
  "Practical framework for Vision, Momentum, and Health",
];

const problemPoints = [
  "assumptions instead of clarity",
  "agreement in meetings instead of real buy-in",
  "accountability that depends on personalities instead of structure",
  "issues that are known, but not properly surfaced or solved",
];

const resultPoints = [
  "priorities drift",
  "execution slows",
  "the same issues keep resurfacing",
  "the founder becomes the bottleneck again",
];

const bos360Cards = [
  {
    name: "Vision",
    icon: Target,
    text: "Getting everyone in the organization aligned on where the company is going and how it plans to get there.",
  },
  {
    name: "Momentum",
    icon: Workflow,
    text: "Instilling focus, discipline, and accountability so the team executes consistently, quarter after quarter.",
  },
  {
    name: "Health",
    icon: ShieldCheck,
    text: "Creating a more cohesive leadership team and a stronger culture where people can do their best work.",
  },
];

const outcomeCards = [
  {
    title: "Shared Vision",
    text: "Vision becomes explicit, not implied.",
  },
  {
    title: "Focused Priorities",
    text: "The team gets clear on what matters most right now.",
  },
  {
    title: "Better Meetings",
    text: "Meetings become decision engines, not status updates.",
  },
  {
    title: "Objective Accountability",
    text: "Accountability becomes structural and consistent, not personality-driven.",
  },
  {
    title: "Earlier Issue Resolution",
    text: "Important problems get surfaced and solved before they spread.",
  },
  {
    title: "Less Founder Dependency",
    text: "The business relies less on the founder to keep everything aligned and moving.",
  },
];

const howItWorksCards = [
  {
    title: "Vision",
    text: "Clarify direction, priorities, and the plan.",
  },
  {
    title: "Momentum",
    text: "Install the cadence that drives execution.",
  },
  {
    title: "Health",
    text: "Strengthen the leadership team so the system actually holds.",
  },
];

const engagementSteps = [
  {
    title: "Warm Intro Call",
    text: "A short call to establish context, confirm fit, and decide whether it makes sense to move into a leadership-team Discovery Meeting.",
  },
  {
    title: "Discovery Meeting",
    text: "A high-value session with the leadership team to surface friction, clarify priorities, and pressure-test whether BOS360 is the right operating system.",
  },
  {
    title: "BOS360 Launch",
    text: "A structured implementation that installs the foundations for Vision, Momentum, and Health across the leadership team.",
  },
  {
    title: "Quarterly + Annual Rhythm",
    text: "A disciplined cadence to keep priorities clear, issues surfaced, and execution compounding over time.",
  },
];

const whyCamCards = [
  {
    title: "Operator turned coach",
    text: "Hands-on leadership experience inside growth-stage companies before moving into coaching and facilitation.",
  },
  {
    title: "High-growth B2B SaaS",
    text: "Deep roots in scaling technology companies where clarity, accountability, and execution are critical.",
  },
  {
    title: "Certified BOS360 coach",
    text: "Certified to implement BOS360, a proven operating system built around Vision, Momentum, and Health.",
  },
  {
    title: "Practical, methodical style",
    text: "Trusted for a calm, structured approach that helps leadership teams get clear, stay focused, and move forward.",
  },
];

const credentials = [
  "Certified BOS360 Coach",
  "EOS facilitation background",
  "Growth-stage operator experience",
];

const companyLogos = [
  { name: "Achievers", src: "/credential-achievers.svg" },
  { name: "TouchBistro", src: "/credential-touchbistro.png" },
  { name: "Kira Talent", src: "/credential-kira-talent.png" },
  { name: "Ten Thousand Coffees", src: "/credential-ten-thousand-coffees.png" },
  { name: "Autohost", src: "/credential-autohost.png" },
  { name: "CTC", src: "/logos/ctc-communications.png" },
];

const proofTags = ["B2B SaaS", "Leadership Teams", "BOS360"];

const testimonials = [
  {
    quote:
      "[Placeholder testimonial] Add a short founder or CEO quote about stronger leadership alignment, cleaner decisions, and more consistent execution.",
    source: "Placeholder founder / CEO",
  },
  {
    quote:
      "[Placeholder testimonial] Add a quote about Cam bringing calm structure, stronger accountability, and a better operating cadence to the leadership team.",
    source: "Placeholder executive team member",
  },
  {
    quote:
      "[Placeholder testimonial] Add a quote about reducing founder bottleneck risk and building a more self-managing leadership rhythm.",
    source: "Placeholder operator / client",
  },
];

const fitGood = [
  "Founder-led company",
  "Leadership team in place",
  "Growth is creating friction, inconsistency, or complexity",
  "The founder wants to stop being the bottleneck",
  "The team is open to honest conversations",
  "There is appetite for structure, not just ideas",
];

const fitBad = [
  "Looking for generic consulting advice",
  "Wants validation more than change",
  "Avoids hard conversations",
  "Unwilling to commit to a system",
  "No real leadership team in place yet",
];

function PrimaryButton({ href, children }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.72)] transition hover:-translate-y-0.5 hover:opacity-90"
    >
      {children}
    </a>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-500/15"
    >
      {children}
    </Link>
  );
}

function SectionIntro({ eyebrow, title, body, align = "left", invert = false }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`mt-3 text-3xl font-bold tracking-tight md:text-4xl ${invert ? "text-white" : "text-slate-100"}`}>
        {title}
      </h2>
      {body ? (
        <p className={`mt-4 text-base leading-7 md:text-lg ${invert ? "text-slate-300" : "text-slate-300"}`}>
          {body}
        </p>
      ) : null}
    </div>
  );
}

export default function CoachingV2Page() {
  const featuredPosts = blogPosts.slice(0, 3);

  return (
    <main className="coaching-theme min-h-screen bg-neutral-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-28 -top-36 h-[34rem] w-[34rem] rounded-full bg-[#ed7d31]/20 blur-3xl" />
        <div className="absolute -right-24 top-[18rem] h-[30rem] w-[30rem] rounded-full bg-neutral-600/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/coaching-v2" className="inline-flex min-w-0 items-center gap-3">
              <span className="inline-flex overflow-hidden rounded-2xl border border-neutral-700 bg-white p-1 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.7)]">
                <Image
                  src="/bos360-logo-white-bg.png"
                  alt="BOS360"
                  width={108}
                  height={44}
                  className="h-10 w-auto object-contain"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">
                  Cam Lillico
                </span>
                <span className="block text-sm font-semibold text-slate-100">
                  BOS360 Coaching
                </span>
              </span>
            </Link>
            <span className="hidden overflow-hidden rounded-xl border border-neutral-700 bg-white shadow-[0_12px_30px_-20px_rgba(0,0,0,0.6)] lg:inline-flex">
              <Image
                src="/bos360-certified-business-coach.jpg"
                alt="BOS360 Certified Business Coach"
                width={186}
                height={68}
                className="h-11 w-auto object-contain"
              />
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <Link href="/coaching-v2" className="transition hover:text-slate-100">
              Coaching
            </Link>
            <Link href={STRENGTH_TEST_URL} className="transition hover:text-slate-100">
              Strength Test
            </Link>
            <Link href={BLOG_URL} className="transition hover:text-slate-100">
              Blog
            </Link>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-4 py-2 text-slate-950 transition hover:opacity-90"
            >
              Warm Intro Call
            </a>
          </nav>
        </div>
        <div className="border-t border-neutral-800 px-6 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-2 text-xs font-semibold text-slate-200">
            <Link href="/coaching-v2" className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5">
              Coaching
            </Link>
            <Link href={STRENGTH_TEST_URL} className="rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 py-1.5 text-cyan-200">
              Strength Test
            </Link>
            <Link href={BLOG_URL} className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5">
              Blog
            </Link>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-3 py-1.5 text-slate-950"
            >
              Warm Intro Call
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_23rem] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-800 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)]">
              <Layers3 size={14} />
              BOS360 for founder-led leadership teams
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight text-slate-100 md:text-7xl">
              Turn Vision Into
              <span className="block text-orange-200">Execution with BOS360</span>
            </h1>

            <div className="mt-6 flex max-w-4xl items-start gap-5">
              <Image
                src="/cam-headshot-circle.png"
                alt="Cam Lillico"
                width={112}
                height={112}
                priority
                className="h-24 w-24 shrink-0 rounded-full border border-neutral-700 object-cover shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] md:h-28 md:w-28"
              />
              <div>
                <p className="text-xl leading-8 text-slate-300">
                  I help founder-led companies implement BOS360 — a proven operating
                  system that helps leadership teams get aligned, accountable, and
                  executing consistently.
                </p>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
                  For growing companies with a leadership team in place, where progress
                  is real but friction, drift, or founder dependence is starting to show.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 xl:max-w-[52rem] md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-neutral-700 bg-neutral-900/85 p-4 shadow-[0_24px_50px_-34px_rgba(0,0,0,0.6)]">
                <PrimaryButton href={BOOKING_URL}>
                  Book an Intro Call
                  <ArrowRight size={16} />
                </PrimaryButton>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  The Intro Call is a short conversation to establish context, confirm
                  fit, and determine whether it makes sense to bring your leadership team
                  into a Discovery Meeting.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-neutral-700 bg-neutral-900/85 p-4 shadow-[0_24px_50px_-34px_rgba(0,0,0,0.6)]">
                <SecondaryButton href={STRENGTH_TEST_URL}>
                  Take the Strength Test
                  <Sparkles size={16} />
                </SecondaryButton>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  In 3–5 minutes, you’ll get a clear baseline across Business, Brand,
                  Team, Strategy, Execution, and Culture. It helps us focus your
                  discovery call on the real bottlenecks instead of surface symptoms.
                </p>
                <div className="mt-4 inline-flex flex-col rounded-xl border border-neutral-700 bg-neutral-950/80 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                  <span>20 questions · Instant results</span>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[9px] tracking-[0.08em] text-slate-200">
                    <User size={10} aria-hidden />
                    <Mail size={10} aria-hidden />
                    Name + email required
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {trustItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-neutral-700 bg-neutral-900/80 px-4 py-4 shadow-[0_24px_50px_-34px_rgba(0,0,0,0.6)] backdrop-blur"
                >
                  <p className="text-sm font-semibold text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-6 text-slate-100 shadow-[0_40px_80px_-36px_rgba(0,0,0,0.85)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                    BOS360 system view
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Vision. Momentum. Health.</h2>
                </div>
                <div className="rounded-full border border-neutral-700 bg-neutral-950/70 p-3">
                  <Crosshair size={18} className="text-[#ed7d31]" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {bos360Cards.map((item, index) => (
                  <div key={item.name} className="relative rounded-2xl border border-neutral-700 bg-neutral-950/70 p-4">
                    {index < bos360Cards.length - 1 ? (
                      <span className="absolute left-7 top-full h-4 w-px bg-neutral-700" />
                    ) : null}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl border border-neutral-700 bg-neutral-900 p-2">
                        <item.icon size={16} className="text-[#ed7d31]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                          {item.name}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#ed7d31]/30 bg-[#ed7d31]/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-200">
                  Designed for
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Founder/CEOs of growth-stage B2B SaaS and tech-enabled businesses
                  with a real leadership team and rising execution friction.
                </p>
              </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-900/40 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <SectionIntro
            eyebrow="The friction"
            title="What Often Looks Like Alignment Isn’t"
            body="Most founders do not struggle with ideas. They struggle with consistently turning those ideas into execution across a leadership team."
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.45)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                What it gets mistaken for
              </p>
              <ul className="mt-5 space-y-4">
                {problemPoints.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CircleDot size={18} className="mt-0.5 shrink-0 text-[#ed7d31]" />
                    <span className="text-sm leading-6 text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-6 text-slate-100 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.7)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                What it turns into
              </p>
              <ul className="mt-5 space-y-4">
                {resultPoints.map((item) => (
                  <li key={item} className="flex gap-3">
                    <MoveRight size={18} className="mt-0.5 shrink-0 text-[#ed7d31]" />
                    <span className="text-sm leading-6 text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-8 shadow-[0_28px_80px_-44px_rgba(0,0,0,0.55)]">
            <SectionIntro
              eyebrow="The reframe"
              title="The Problem Usually Isn’t Talent"
              body="Most leadership teams are not underperforming because they lack smart or capable people."
            />
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              More often, they are operating without a system that forces clarity,
              discipline, accountability, and follow-through.
            </p>
            <div className="mt-8 rounded-[1.5rem] border border-[#ed7d31]/30 bg-[#ed7d31]/10 p-6">
              <p className="text-xl font-semibold leading-8 text-slate-100">
                It is not usually a people problem first.
                <span className="block text-orange-200">It is a system problem.</span>
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                System requirements
              </p>
              <div className="mt-5 space-y-3">
                {["Clarity", "Discipline", "Accountability", "Follow-through"].map((item) => (
                  <div key={item} className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm font-semibold text-slate-100">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-6 text-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                Executive reality
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Strong people with a weak operating system still create drift,
                ambiguity, and founder dependency. BOS360 is designed to correct
                that at the leadership-team level.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-900/40 py-20 text-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <SectionIntro
            eyebrow="The operating system"
            title="What BOS360 Actually Is"
            body="BOS360 is a proven business operating system designed to help leadership teams strengthen three critical areas: Vision, Momentum, and Health."
            invert
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {bos360Cards.map((item) => (
              <article
                key={item.name}
                className="rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-7 shadow-[0_30px_70px_-42px_rgba(0,0,0,0.65)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-3">
                    <item.icon size={18} className="text-[#ed7d31]" />
                  </div>
                  <h3 className="text-2xl font-semibold">{item.name}</h3>
                </div>
                <p className="mt-5 text-base leading-7 text-slate-300">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-[#ed7d31]/30 bg-[#ed7d31]/10 px-6 py-5">
            <p className="text-lg font-semibold text-slate-100">
              This is not generic coaching and it is not abstract advice. BOS360 is
              tried, tested, and true.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionIntro
          eyebrow="What changes"
          title="What Changes When BOS360 Is Working"
          body="The visible shift is not just better meetings or better plans. It is a leadership team that can actually hold alignment and execution together over time."
          align="center"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {outcomeCards.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-6 shadow-[0_26px_70px_-44px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-[#ed7d31]/30 bg-[#ed7d31]/10 p-3">
                  <CheckCircle2 size={18} className="text-[#ed7d31]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-900/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionIntro
            eyebrow="How it works"
            title="How It Works"
            body="BOS360 is built around three integrated disciplines that keep leadership teams aligned in practice, not just in principle."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {howItWorksCards.map((item, index) => (
              <article
                key={item.title}
                className="relative rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-7 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.55)]"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                  0{index + 1}
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-slate-100">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-slate-300">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <SectionIntro
            eyebrow="Engagement path"
            title="What Engagement Looks Like"
            body="The process is structured, credible, and easy to understand. It starts with fit, moves into leadership-team diagnosis, and then installs the operating rhythm."
          />

          <ol className="grid gap-4">
            {engagementSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-[1.5rem] border border-neutral-700 bg-neutral-900 p-6 shadow-[0_22px_60px_-42px_rgba(0,0,0,0.55)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ed7d31]/30 bg-[#ed7d31]/10 text-sm font-semibold text-orange-200">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-slate-100">{step.title}</h3>
                  </div>
                  {index === 0 ? (
                    <a
                      href={BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-950 transition hover:opacity-90"
                    >
                      Book now
                      <ChevronRight size={14} />
                    </a>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-900/40 py-20 text-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">
                Strength Test
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                See Where Your Leadership Team Actually Stands
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                The Strength Test is a practical diagnostic that helps assess how
                strong your business is across the key areas that drive alignment,
                execution, and organizational health.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
                It is a simple way to identify where things are solid, where friction
                is building, and where more structure may be needed.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <SecondaryButton href={STRENGTH_TEST_URL}>
                  Take the Strength Test
                  <ArrowRight size={16} />
                </SecondaryButton>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                What it helps reveal
              </p>
              <div className="mt-5 space-y-3">
                {[
                  "where things are solid",
                  "where friction is building",
                  "where more structure may be needed",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-8 shadow-[0_32px_80px_-46px_rgba(0,0,0,0.55)]">
            <SectionIntro
              eyebrow="Why Cam"
              title="An experienced operator with a practical, structured facilitation style"
              body="Cam brings real operating experience, pattern recognition from high-growth environments, and a calm, methodical style that helps leadership teams cut through the noise of scaling."
            />

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {whyCamCards.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] border border-neutral-700 bg-neutral-950 p-5"
                >
                  <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.text}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => (
                <blockquote
                  key={item.source}
                  className="rounded-[1.5rem] border border-neutral-700 bg-neutral-950 p-5"
                >
                  <p className="text-sm leading-6 text-slate-300">{item.quote}</p>
                  <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-orange-200">
                    {item.source}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-7 text-slate-100 shadow-[0_30px_80px_-42px_rgba(0,0,0,0.85)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                Credentials at a glance
              </p>
              <div className="mt-5 space-y-3">
                {credentials.map((item) => (
                  <div key={item} className="rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm font-semibold text-slate-200">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                  Companies
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {companyLogos.map((logo) => (
                    <div
                      key={logo.name}
                      className="flex min-h-[84px] items-center justify-center rounded-2xl border border-white/10 bg-white px-4 py-3"
                    >
                      <Image
                        src={logo.src}
                        alt={`${logo.name} logo`}
                        width={140}
                        height={40}
                        className="max-h-10 w-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
              {proofTags.map((tag) => (
                <div
                  key={tag}
                  className="rounded-[1.5rem] border border-neutral-700 bg-neutral-900 px-5 py-4 text-sm font-semibold text-slate-100 shadow-[0_20px_50px_-38px_rgba(0,0,0,0.5)]"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-900/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionIntro
            eyebrow="Fit"
            title="Who This Is For"
            body="BOS360 works best when the company has enough leadership capacity, enough complexity, and enough appetite for real operating discipline."
            align="center"
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-7 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.55)]">
              <h3 className="inline-flex items-center gap-3 text-2xl font-semibold text-slate-100">
                <CheckCircle2 size={20} className="text-[#ed7d31]" />
                Good fit
              </h3>
              <ul className="mt-6 space-y-4">
                {fitGood.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <ChevronRight size={18} className="mt-0.5 shrink-0 text-[#ed7d31]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-7 text-slate-100 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.75)]">
              <h3 className="inline-flex items-center gap-3 text-2xl font-semibold">
                <XCircle size={20} className="text-orange-200" />
                Not a fit
              </h3>
              <ul className="mt-6 space-y-4">
                {fitBad.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <ChevronRight size={18} className="mt-0.5 shrink-0 text-orange-200" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <SectionIntro
            eyebrow="Leadership Insights"
            title="Insights on Leadership Teams, Execution, and BOS360"
            body="Practical thinking on leadership alignment, operating systems, execution rhythm, and founder-led growth."
          />

          <div className="grid gap-4">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/coaching/blog/${post.slug}`}
                className="group rounded-[1.5rem] border border-neutral-700 bg-neutral-900 p-5 shadow-[0_22px_60px_-42px_rgba(0,0,0,0.55)] transition hover:-translate-y-0.5 hover:border-neutral-500"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    width={160}
                    height={96}
                    unoptimized
                    className="h-32 w-full rounded-2xl border border-neutral-700 object-cover md:h-24 md:w-40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">
                      {post.category} · {post.readTime}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-100 transition group-hover:text-orange-200">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {post.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            <div className="pt-2">
              <Link
                href={BLOG_URL}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
              >
                Visit the Blog
                <BookOpen size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 bg-neutral-900/40 py-20 text-slate-100">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">
            Final CTA
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            A Simple Next Step
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            The best next step is a Warm Intro Call.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-slate-400">
            A short conversation to determine whether BOS360 is relevant, what may
            be missing in your current leadership rhythm, and whether it makes sense
            to move to a Discovery Meeting.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PrimaryButton href={BOOKING_URL}>
              Book a Warm Intro Call
              <CalendarDays size={16} />
            </PrimaryButton>
            <SecondaryButton href={STRENGTH_TEST_URL}>
              Take the Strength Test
              <Sparkles size={16} />
            </SecondaryButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-800 bg-neutral-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/coaching-v2" className="transition hover:text-slate-100">
              Coaching
            </Link>
            <Link href={STRENGTH_TEST_URL} className="transition hover:text-cyan-200">
              Strength Test
            </Link>
            <Link href={BLOG_URL} className="transition hover:text-slate-100">
              Blog
            </Link>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-orange-200"
            >
              Warm Intro Call
            </a>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
