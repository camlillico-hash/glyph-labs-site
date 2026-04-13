import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  TriangleAlert,
  Crosshair,
  Layers3,
  Mail,
  MoveRight,
  MessageSquareQuote,
  Quote,
  ShieldCheck,
  Star,
  Target,
  ThumbsUp,
  User,
  Workflow,
  XCircle,
} from "lucide-react";
import Bos360SiteHeader from "@/app/components/Bos360SiteHeader";
import { blogPosts } from "@/app/coaching/blogPosts";
export const metadata = {
  title: "Cam Lillico | BOS360 Coaching",
  icons: {
    icon: "/bos360/icon.png",
    shortcut: "/bos360/icon.png",
    apple: "/bos360/icon.png",
  },
};

const BOOKING_URL = "https://calendar.app.google/M4pokXD8CBpc1c4U6";
const STRENGTH_TEST_URL = "/strength-test";
const BLOG_URL = "/coaching/blog";
const FEATURED_ARTICLE = blogPosts[0];

const trustItems = [
  "Certified BOS360 Coach",
  "Operator experience in growth-stage B2B SaaS",
  "Practical framework for Vision, Momentum, and Health",
];

const problemPoints = [
  "Assumptions Instead of Clarity",
  "Agreement in Meetings Instead of Real Buy-In",
  "Accountability That Depends on Personalities Instead of Structure",
  "Issues That Are Known, but Not Properly Surfaced or Solved",
];

const resultPoints = [
  "Priorities Drift",
  "Execution Slows",
  "The Same Issues Keep Resurfacing",
  "The Founder Becomes the Bottleneck Again",
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
    title: "Intro Call",
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
  {
    title: "Certified BOS360 Coach",
    href: "https://bos360.ca",
    image: "/badge-bos360.jpg",
    imageAlt: "BOS360 certification badge",
  },
  {
    title: "Expert in Residence",
    href: "https://innovationcluster.ca/",
    image: "/badge-innovation-cluster.jpg",
    imageAlt: "Innovation Cluster logo",
  },
  {
    title: "EOS facilitation 2017-2025",
    href: "https://www.eosworldwide.com/",
    image: "/badge-eos.jpg",
    imageAlt: "EOS Worldwide logo",
  },
];

const companyLogos = [
  { name: "Achievers", src: "/credential-achievers.svg" },
  { name: "TouchBistro", src: "/credential-touchbistro-from-url.png" },
  { name: "Kira Talent", src: "/credential-kira-talent.png" },
  { name: "Ten Thousand Coffees", src: "/credential-ten-thousand-coffees.png" },
  { name: "Autohost", src: "/credential-autohost.png" },
  { name: "CTC", src: "/logos/ctc-communications.png" },
];

const testimonials = [
  {
    quote:
      "Cam balanced strategy with accountability. He challenged assumptions, clarified ownership, and helped us move from busy activity to focused execution.",
    source: "Brennan Smith, CEO at CTC Communications",
  },
  {
    quote:
      "Cam brought structure without bureaucracy. We left each session with clear decisions, named owners, and measurable momentum at the stage we needed it most.",
    source: "Roy Firestein, CEO at Autohost",
  },
  {
    quote:
      "Cam leads with humility and creates the kind of environment where leadership teams can have open, honest conversations without defensiveness. He facilitates with clarity, asks sharp questions, and helps teams turn insight into real execution.",
    source: "Shelby Hacala, Founder, Nav360",
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

function SectionIntro({ eyebrow, title, body, align = "left", invert = false, icon: Icon }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-3 flex items-center gap-3 text-3xl font-bold tracking-tight md:text-4xl ${
          align === "center" ? "justify-center" : ""
        } ${invert ? "text-white" : "text-slate-100"}`}
      >
        {Icon ? <Icon size={24} className="shrink-0 text-[#ed7d31]" /> : null}
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
  return (
    <main className="coaching-theme min-h-screen bg-neutral-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-28 -top-36 h-[34rem] w-[34rem] rounded-full bg-[#ed7d31]/20 blur-3xl" />
        <div className="absolute -right-24 top-[18rem] h-[30rem] w-[30rem] rounded-full bg-neutral-600/20 blur-3xl" />
      </div>

      <Bos360SiteHeader current="coaching" />

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_23rem] lg:items-start">
          <div>
            <h1 className="max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight text-slate-100 md:text-7xl">
              Turn Vision Into
              <span className="block text-orange-200">Execution with BOS360</span>
            </h1>

            <div className="mt-6 flex max-w-4xl items-center gap-6">
              <div className="w-36 shrink-0 md:w-44">
                <Image
                  src="/cam-headshot-circle.png"
                  alt="Cam Lillico"
                  width={112}
                  height={112}
                  priority
                  className="h-36 w-36 rounded-full border-[15px] border-white object-cover shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] md:h-44 md:w-44"
                />
                <div className="-mt-6 mx-auto w-fit rounded-2xl bg-neutral-900/85 px-3 py-3 shadow-[0_24px_50px_-34px_rgba(0,0,0,0.6)] backdrop-blur md:-mt-8">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/bos360-certified-business-coach.jpg"
                      alt="BOS360 Certified Business Coach"
                      width={80}
                      height={80}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <p className="text-xs font-semibold leading-4 text-slate-100">Certified BOS360 Coach</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xl leading-8 text-slate-300">
                  I help founder-led companies implement BOS360 — a proven operating
                  system that helps leadership teams get aligned, accountable, and
                  executing consistently.
                </p>
              </div>
            </div>

            <div className="mt-8 max-w-[44rem] rounded-2xl border border-neutral-700 bg-neutral-900/85 p-6 shadow-[0_24px_50px_-34px_rgba(0,0,0,0.6)] md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">
                Free Diagnostic
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-100 md:text-3xl">
                Take the Strength Test before we talk.
              </h2>
              <p className="mt-3 max-w-4xl text-slate-300">
                In 3–5 minutes, you&apos;ll get a clear baseline across Business,
                Brand, Team, Strategy, Execution, and Culture. It helps us focus
                your discovery call on the real bottlenecks instead of surface
                symptoms.
              </p>
              <div className="mt-5 flex flex-wrap items-stretch gap-3">
                <Link
                  href={STRENGTH_TEST_URL}
                  className="inline-flex min-h-[56px] w-[260px] items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-500 to-blue-600 px-5 py-2.5 text-center text-slate-950 transition hover:opacity-90"
                >
                  <span className="block text-base font-extrabold">
                    Start the Strength Test
                  </span>
                </Link>
                <span className="inline-flex w-[260px] flex-col items-center justify-center rounded-xl px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                  20 questions · Instant results
                  <span className="mt-1 inline-flex items-center justify-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-slate-200">
                    <User size={10} aria-hidden />
                    <Mail size={10} aria-hidden />
                    Name + email required
                  </span>
                </span>
              </div>
            </div>

          </div>

          <aside className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-6 text-slate-100 shadow-[0_40px_80px_-36px_rgba(0,0,0,0.85)]">
              <div className="pb-4">
                <Image
                  src="/bos360-logo-watermark.png"
                  alt="BOS360"
                  width={218}
                  height={50}
                  className="-ml-[10px] block h-auto w-[13.625rem] object-contain"
                />
                <div className="mt-3 border-t border-neutral-700 pt-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">
                  proven to help you master:
                </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
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
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-orange-200">
                  <ThumbsUp size={14} className="shrink-0" />
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
        <div className="mx-auto max-w-7xl px-6">
          <SectionIntro
            eyebrow="The real problem"
            title="When Smart Teams Still Struggle to Execute"
            body="You can have a smart, committed leadership team and still get drift, repeated issues, and founder dependency. Usually that is not a smarts problem. It is a system problem."
            icon={Crosshair}
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2">
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
        <div className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-8 text-slate-100 shadow-[0_30px_70px_-42px_rgba(0,0,0,0.65)] md:p-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30rem)] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">
                How it works
              </p>
              <h2 className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">
                <Target size={24} className="shrink-0 text-[#ed7d31]" />
                The Core Model
              </h2>
              <div className="mt-4 space-y-4 text-base leading-7 text-slate-300 md:text-lg">
                <p>
                  The BOS360 Core Model provides a unique framework to cover the core
                  components of your business and their interconnectivity.
                </p>
                <p>
                  The most successful organizations simultaneously build Three Core
                  Pillars: <strong className="font-semibold text-slate-100">BUSINESS, BRAND,</strong> and{" "}
                  <strong className="font-semibold text-slate-100">TEAM.</strong>
                </p>
                <p>
                  This is accomplished by strengthening the Three Bonding Forces:{" "}
                  <strong className="font-semibold text-slate-100">Strategy, Execution,</strong> and{" "}
                  <strong className="font-semibold text-slate-100">Culture.</strong>
                </p>
                <p>
                  With a complete set of proven principles and simple tools BOS360
                  helps you pull everything together with consistency.
                </p>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-[36.4rem] items-center justify-center rounded-[1.75rem] border border-neutral-700 bg-neutral-950 p-5 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.55)]">
              <Image
                src="/bos360-core-model.png"
                alt="BOS360 Core Model diagram"
                width={900}
                height={900}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-[#ed7d31]/30 bg-[#ed7d31]/10 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-[#ed7d31]/30 bg-neutral-950/20 p-3">
                <Bell size={18} className="text-[#ed7d31]" />
              </div>
              <p className="text-lg font-semibold text-slate-100">
                This is not generic coaching and it is not abstract advice. BOS360 is
                tried, tested, and true.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionIntro
          eyebrow="Results you feel, quickly"
          title="What Changes When BOS360 Is Working"
          body="The visible shift is not just better meetings or better plans. It is a leadership team that can actually hold alignment and execution together over time."
          align="center"
          icon={CheckCircle2}
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

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10">
          <SectionIntro
            eyebrow="Engagement path"
            title="Implementing BOS360"
            body="The process is structured, credible, and easy to understand. It starts with fit, moves into leadership-team diagnosis, and then installs the operating rhythm."
            icon={Workflow}
          />

          <div className="grid gap-4 lg:grid-cols-[48rem_29.9rem] lg:justify-center">
            {engagementSteps.slice(0, 2).map((step, index) => (
              <div
                key={step.title}
                className="w-full rounded-[1.5rem] border border-neutral-700 bg-neutral-900 p-6 shadow-[0_22px_60px_-42px_rgba(0,0,0,0.55)]"
              >
                <div className="flex flex-wrap items-center gap-3">
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
              </div>
            ))}

            <div className="relative flex h-[40.875rem] w-full items-center justify-center rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-[15px] shadow-[0_24px_70px_-46px_rgba(0,0,0,0.55)]">
              <span className="absolute left-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ed7d31]/30 bg-[#ed7d31]/10 text-sm font-semibold text-orange-200">
                3
              </span>
              <Image
                src="/bos360-diagram-launch.png"
                alt="BOS360 launch diagram"
                width={1600}
                height={900}
                className="h-[39rem] w-auto object-contain"
              />
            </div>
            <div className="relative flex h-[40.875rem] w-full items-center justify-center rounded-[1.75rem] border border-neutral-700 bg-neutral-900 p-[15px] shadow-[0_24px_70px_-46px_rgba(0,0,0,0.55)]">
              <span className="absolute left-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ed7d31]/30 bg-[#ed7d31]/10 text-sm font-semibold text-orange-200">
                4
              </span>
              <Image
                src="/bos360-diagram-rhythm.png"
                alt="BOS360 rhythm diagram"
                width={1600}
                height={900}
                className="h-[37.5rem] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-900/40 py-20 text-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="cta-panel-secondary relative overflow-hidden rounded-[2rem] px-8 py-10 shadow-[0_38px_90px_-52px_rgba(0,0,0,0.18)] md:px-10 md:py-12">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-64 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.14),_transparent_62%)] lg:block" />
            <div className="relative mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">
                Strength Test
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-100 md:text-5xl">
                Get a Fast Read on Where the Friction Is
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                Take the diagnostic to quickly see where alignment, execution, or
                team health may be slipping.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <SecondaryButton href={STRENGTH_TEST_URL}>
                  Take the Strength Test
                  <ArrowRight size={16} />
                </SecondaryButton>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                  20 questions · instant results
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-8 shadow-[0_32px_80px_-46px_rgba(0,0,0,0.55)]">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-3 text-lg font-semibold uppercase tracking-[0.18em] text-orange-200 md:text-xl">
                <Image
                  src="/cam-headshot-circle.png"
                  alt="Cam Lillico"
                  width={36}
                  height={36}
                  className="h-8 w-8 shrink-0 rounded-full border border-white/70 object-cover md:h-9 md:w-9"
                />
                Why Cam
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">
                An experienced operator with a practical, structured facilitation style
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
                Cam brings real operating experience, pattern recognition from high-growth environments, and a calm, methodical style that helps leadership teams cut through the noise of scaling.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {whyCamCards.map((item) => (
                <article
                  key={item.title}
                  className="why-cam-card rounded-[1.5rem] border border-neutral-700 bg-[#ed7d31]/[0.06] p-5 transition"
                >
                  <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-100">
                    <CheckCircle2 size={16} className="shrink-0 text-[#ed7d31]" />
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-neutral-700 bg-neutral-900 p-7 text-slate-100 shadow-[0_30px_80px_-42px_rgba(0,0,0,0.85)]">
              <p className="mt-[15px] text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-orange-200 md:text-[13px]">
                Credentials at a glance
              </p>
              <div className="mt-5 flex flex-col items-center gap-3">
                {credentials.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="credential-card group inline-flex w-full max-w-[18.5rem] items-center gap-4 rounded-2xl border border-neutral-700 bg-[#ed7d31]/[0.06] px-4 py-3 transition"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white p-2">
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        width={56}
                        height={56}
                        className="max-h-8 w-auto object-contain"
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-200 transition group-hover:text-slate-100">
                      {item.title}
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-8 border-t border-neutral-800 pt-8">
                <p className="text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-orange-200 md:text-[13px]">
                  Companies
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {companyLogos.map((logo) => (
                    <div
                      key={logo.name}
                      className="flex min-h-[84px] items-center justify-center rounded-2xl bg-white px-4 py-3"
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

          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-neutral-700 bg-neutral-900 p-6 shadow-[0_30px_80px_-46px_rgba(0,0,0,0.55)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[#ed7d31]/30 bg-[#ed7d31]/10 p-3">
              <Star size={18} className="fill-current text-[#ed7d31]" />
            </div>
            <p className="text-base font-semibold uppercase tracking-[0.18em] text-orange-200 md:text-lg">
              Trusted by growing businesses
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote
                key={item.source}
                className="rounded-[1.5rem] border border-neutral-700 bg-neutral-950 p-5"
              >
                <p className="text-sm leading-6 text-slate-300">
                  <span className="mr-1 inline-block -translate-y-0.5 text-xl font-bold leading-none text-[#ed7d31]">
                    &rdquo;
                  </span>
                  {item.quote}
                  <span className="ml-1 inline-block -translate-y-0.5 text-xl font-bold leading-none text-[#ed7d31]">
                    &ldquo;
                  </span>
                </p>
                <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-orange-200">
                  {item.source}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-900/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionIntro
            eyebrow=""
            title="Who This Is For"
            body="BOS360 works best when the company has enough leadership capacity, enough complexity, and enough appetite for real operating discipline."
            align="center"
            icon={Target}
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

      <section className="border-t border-neutral-800 bg-neutral-900/40 py-20 text-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="cta-panel-primary rounded-[2rem] p-8 shadow-[0_34px_90px_-50px_rgba(0,0,0,0.2)]">
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-100 md:text-5xl">
                Ready to Scale with More Clarity?
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Let&apos;s talk about your current stage, your next growth targets,
                and the operating cadence to get you there.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryButton href={BOOKING_URL}>
                  Book an intro call
                  <CalendarDays size={16} />
                </PrimaryButton>
              </div>
            </div>

            <div className="p-8 text-slate-100">
              <h2 className="text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">
                Still exploring?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Start with this article for a quick feel for how I think about
                alignment, execution, and founder-led growth.
              </p>

              <Link
                href={`/coaching/blog/${FEATURED_ARTICLE.slug}`}
                className="group mt-7 block rounded-[1.5rem] border border-white/12 bg-white/5 p-4 transition hover:border-white/18 hover:bg-[#e5e7eb]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="overflow-hidden rounded-[1rem] bg-white/8 transition group-hover:bg-[#d1d5db]">
                    <Image
                      src={FEATURED_ARTICLE.thumbnail}
                      alt={FEATURED_ARTICLE.title}
                      width={320}
                      height={180}
                      unoptimized
                      className="h-28 w-full object-cover opacity-90 transition sm:w-40 group-hover:opacity-80"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 group-hover:text-slate-600">
                      <span>{FEATURED_ARTICLE.category}</span>
                      <span className="text-slate-400 group-hover:text-slate-500">•</span>
                      <span>{FEATURED_ARTICLE.readTime}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-100 group-hover:text-slate-900">
                      {FEATURED_ARTICLE.title}
                    </h3>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-200 group-hover:text-slate-800">
                      Read the article
                      <BookOpen size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-800 bg-neutral-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/bos360" className="transition hover:text-slate-100">
              Coaching
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
            <Link href={STRENGTH_TEST_URL} className="transition hover:text-cyan-200">
              Strength Test
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
