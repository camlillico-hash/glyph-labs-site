import React from "react";
import {
  ClipboardList,
  BookOpenCheck,
  ArrowRight,
  FileDown,
  MessageSquareText,
  Sparkles,
  BadgeCheck,
  CheckCircle2,
  Link2,
  Users,
  Target,
  Workflow,
  HeartHandshake,
  Mail,
  CalendarDays,
  Linkedin,
  UserSearch,
  Waypoints,
  PanelTop,
  Compass,
} from "lucide-react";
import CopyButton from "./CopyButton";

export const metadata = {
  title: "Referral Kit | Cam Lillico",
  robots: { index: false, follow: false },
};

const BOOKING_URL = "https://calendar.app.google/M4pokXD8CBpc1c4U6";

export default function ReferralKitPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div className="inline-flex min-w-0 items-center gap-2" aria-label="Cam Lillico Coaching">
            <a href="/coaching" className="inline-flex items-center" aria-label="Cam Lillico Coaching home">
              <img
                src="/logos/glyphlabs-coaching-mark.png"
                alt="Coaching mark"
                className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              />
            </a>
            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-700 sm:inline-flex">
              Cam Lillico Business Coaching
            </span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <a
              href="/strength-test"
              className="rounded-lg border border-cyan-600/30 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              Start Strength Test
            </a>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:opacity-90"
            >
              Book an Intro Call
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-2 sm:hidden">
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-700">
          Cam Lillico Business Coaching
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-6">
        <div className="w-full rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">For trusted partners and referrers</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                This page is built to help you quickly spot good-fit founders in your network and make a simple, meaningful introduction.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-14 pt-5 md:pt-6">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Referral enablement</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
            Make strong founder introductions with confidence
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            This kit gives you the language, fit criteria, and next steps to introduce Cam to founders and leadership teams who need more clarity, accountability, and execution discipline.
          </p>

          <div className="mt-8 relative overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-white p-7 shadow-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-amber-200/50 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <img
                src="/cam-headshot-circle.png"
                alt="Cam Lillico"
                className="h-20 w-20 shrink-0 rounded-full border border-orange-200 object-cover shadow-lg shadow-orange-100 sm:h-24 sm:w-24"
                loading="eager"
              />
              <div className="min-w-0">
                <SectionLabel>Facilitation</SectionLabel>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  Cam is a certified and experienced facilitator with 100s of sessions under his belt
                </h3>
              </div>
            </div>

            <p className="relative mt-5 text-sm leading-7 text-slate-600">
              He brings a calm, practical presence to leadership conversations and knows how to guide teams toward clarity, accountability, and better decisions without adding unnecessary complexity.
            </p>

            <div className="relative mt-6 grid gap-3">
              <a
                href="https://bos360.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-orange-200/80 bg-white/90 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white"
              >
                <img src="/badge-bos360.png" alt="BOS360™" className="h-10 w-10 rounded-lg object-cover" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">BOS360™</p>
                  <p className="text-sm font-semibold text-slate-900">Certified Coach</p>
                </div>
              </a>
              <a
                href="https://www.eosworldwide.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-orange-200/80 bg-white/90 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white"
              >
                <img src="/badge-eos.jpg" alt="EOS" className="h-10 w-10 rounded-lg object-cover" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">EOS</p>
                  <p className="text-sm font-semibold text-slate-900">Implementor 2018–2024</p>
                </div>
              </a>
              <a
                href="https://innovationcluster.ca/programs/mentors-advisors"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-orange-200/80 bg-white/90 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white"
              >
                <img src="/badge-innovation-cluster.jpg" alt="Innovation Cluster" className="h-10 w-10 rounded-lg object-cover" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Innovation Cluster</p>
                  <p className="text-sm font-semibold text-slate-900">Expert in Residence</p>
                </div>
              </a>
            </div>

            <div className="relative mt-6 flex flex-col items-start gap-3">
              <a
                href="#how-to-refer"
                className="inline-flex items-center justify-center rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-neutral-950 shadow-sm transition-colors hover:bg-orange-300"
              >
                How to Refer Cam
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="/referral-kit-one-pager.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
              >
                Get the PDF Version
                <FileDown className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
          <SectionHeader
            eyebrow="The Ideal Profile"
            title="Who to Look For"
            icon={<UserSearch className="h-5 w-5" />}
          />
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                The best introductions are founder-led or growth-stage companies with real momentum, but growing complexity. These are businesses doing well, but no longer running as cleanly or simply as they should.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                The leadership team has ambition and capability, but execution is inconsistent, priorities get muddy, and too much still depends on a few key people. They do not need more ideas. They need more clarity, accountability, and operating discipline.
              </p>

              <div className="mt-6 grid gap-3">
                <ChecklistItem text="Founder-led or growth-stage companies, typically in the $2M–$50M range" />
                <ChecklistItem text="Leadership teams with strong intent but inconsistent execution" />
                <ChecklistItem text="Teams ready for candid conversations and real accountability" />
                <ChecklistItem text="Companies that want operating discipline without unnecessary bureaucracy" />
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <MessageSquareText className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">Does any of this sound familiar?</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      These are the kinds of scaling pains founders often describe before they put a better operating system in place.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    "We’re growing, but it feels messier than it should.",
                    "Too much still depends on me.",
                    "My leadership team is not fully aligned.",
                    "We meet constantly, but key issues still linger.",
                    "Accountability is inconsistent.",
                    "We’ve hit a ceiling.",
                    "I’m not sure everyone is in the right seat.",
                    "We keep starting initiatives, but they don’t stick.",
                    "Our priorities keep changing.",
                    "We need more clarity on the plan.",
                  ].map((item) => (
                    <QuoteRow key={item} text={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-8">
          <SectionHeader
            eyebrow="The Framework"
            title="The value I provide"
            icon={<PanelTop className="h-5 w-5" />}
          />

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">What is BOS360?</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                BOS360 is a practical business operating system that helps leadership teams strengthen three things: Vision, Momentum, and Health. In plain terms, it gets leaders aligned on where the business is going, builds the discipline and accountability to execute, and creates a healthier, higher-performing team.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MiniCard
                  icon={<ClipboardList className="h-4 w-4" />}
                  title="Vision"
                  text="Getting everyone aligned around where the business is going and how the team will get there."
                />
                <MiniCard
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Momentum"
                  text="Building the focus, discipline, and accountability required for consistent execution."
                />
                <MiniCard
                  icon={<BadgeCheck className="h-4 w-4" />}
                  title="Health"
                  text="Creating a cohesive leadership team and a stronger, higher-performing culture."
                />
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Typical outcomes</h3>
                <div className="mt-4 grid gap-3">
                  <ChecklistItem text="More clarity on where the company is going and how it will get there" />
                  <ChecklistItem text="Better execution, focus, and accountability across the team" />
                  <ChecklistItem text="Healthier leadership dynamics and stronger culture" />
                  <ChecklistItem text="A simpler, more consistent way to run the business" />
                </div>
              </div>
            </div>
          </div>



          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.2fr_1fr]">
              <div className="p-8">
                <div className="max-w-3xl">
                  <SectionLabel>Why Cam?</SectionLabel>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <img
                      src="/cam-headshot-circle.png"
                      alt="Cam Lillico"
                      className="h-14 w-14 rounded-full border border-slate-200 object-cover shadow-sm"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-900">An experienced operator with a practical coaching style</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <a
                          href="https://www.linkedin.com/in/cameron-lillico/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                        <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-orange-700">
                          Operator turned coach
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    Cam brings real operating experience, pattern recognition from high-growth environments, and a calm, methodical style that helps leadership teams cut through the noise of scaling.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <IconCard
                    icon={<MessageSquareText className="h-5 w-5" />}
                    title="Operator Turned Coach"
                    text="Hands-on leadership experience in high-growth environments before moving into coaching."
                  />
                  <IconCard
                    icon={<BookOpenCheck className="h-5 w-5" />}
                    title="High-Growth Tech"
                    text="Deep roots in scaling and exiting firms like Kira Talent and Ten Thousand Coffees."
                  />
                  <IconCard
                    icon={<BadgeCheck className="h-5 w-5" />}
                    title="Certified Coach"
                    text="Certified BOS360 coach and EOS implementor with extensive team facilitation experience."
                  />
                  <IconCard
                    icon={<Sparkles className="h-5 w-5" />}
                    title="Methodical Style"
                    text="Trusted for a calm, practical approach that creates clarity without unnecessary complexity."
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <QuickStat title="20+ Years" text="Business and leadership experience" />
                  <QuickStat title="B2B SaaS" text="Best fit for growth-stage teams navigating complexity" />
                  <QuickStat title="BOS360™" text="A practical framework for Vision, Momentum, and Health" />
                </div>
              </div>

              <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 via-white to-orange-50 p-8 lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Credentials at a glance</p>
                <div className="mt-5 grid gap-3">
                  <a
                    href="https://bos360.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300"
                  >
                    <img src="/badge-bos360.png" alt="BOS360™" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Certified BOS360 Coach</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Practical framework for Vision, Momentum, and Health.</p>
                    </div>
                  </a>
                  <a
                    href="https://www.eosworldwide.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300"
                  >
                    <img src="/badge-eos.jpg" alt="EOS" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">EOS Implementor (2018–2024)</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Extensive facilitation experience helping teams simplify execution.</p>
                    </div>
                  </a>
                  <a
                    href="https://innovationcluster.ca/programs/mentors-advisors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300"
                  >
                    <img src="/badge-innovation-cluster.jpg" alt="Innovation Cluster" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Expert in Residence</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Trusted advisor to founders navigating growth-stage complexity.</p>
                    </div>
                  </a>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Companies</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <LogoTile src="/credential-achievers.png" alt="Achievers" />
                      <LogoTile src="/credential-touchbistro-from-url.png" alt="TouchBistro" />
                      <LogoTile src="/credential-kira-talent.png" alt="Kira Talent" />
                      <LogoTile src="/credential-ten-thousand-coffees.png" alt="Ten Thousand Coffees" />
                      <LogoTile src="/credential-autohost.png" alt="Autohost" />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">Selected operator experience across recognized growth-stage companies.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-to-refer" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-14">
          <SectionHeader
            eyebrow="Enablement Guide"
            title="How to Refer Cam"
            icon={<Compass className="h-5 w-5" />}
          />

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <HowToRow
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    title="01. Confirm interest"
                    text="Mention Cam and BOS360 during your conversation. If they are feeling the strain of scaling, they will usually recognize the problem quickly."
                  />
                  <HowToRow
                    icon={<Link2 className="h-5 w-5" />}
                    title="02. Make the introduction"
                    text="Start a short email or LinkedIn thread. If useful, you can also invite Cam directly into a conversation you are already having with them."
                  />
                  <HowToRow
                    icon={<ArrowRight className="h-5 w-5" />}
                    title="03. Loop Cam in"
                    text="Once the intro is made, Cam takes it from there and makes the next step easy for the founder."
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-7">
              <div className="grid gap-4">
                <ScriptCard
                  title="Short script"
                  text={`“Hey [Founder], I remember you mentioning that growth has felt a bit chaotic lately. You should talk to Cam—he specializes in helping leadership teams install a better operating system. Want an intro?”`}
                />
                <ScriptCard
                  title="Medium script"
                  text={`“I’ve seen Cam help scaling founders get their leadership teams on the same page using the BOS360 framework. It’s a very practical way to cut through the constant fire-fighting. Happy to connect you if that would be helpful.”`}
                />
                <ScriptCard
                  title="Stronger script"
                  text={`“You mentioned that meetings feel unproductive and execution is getting inconsistent. Cam is an operator turned coach who helps teams create more clarity, accountability, and momentum. If you want, I can make a quick intro.”`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="referral-path" className="mx-auto max-w-6xl px-6 pb-14 pt-6">
        <SectionHeader
          eyebrow="The Referral Path"
          title="A seamless transition for any founder you introduce"
          icon={<Waypoints className="h-5 w-5" />}
          centered
        />
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-slate-600">
          The goal is to make it easy for you to introduce Cam, and easy for the founder to take the next right step.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StepCard
            n="1"
            title="Make the referral"
            label="Partner action"
            text="Send the email or LinkedIn intro and share a bit of context on what the founder or team is navigating."
          />
          <StepCard
            n="2"
            title="Warm intro call"
            text="Cam meets with the founder or CEO to confirm fit before any deeper discovery work."
          />
          <StepCard
            n="3"
            title="Free 90-minute discovery"
            text="A no-obligation deep dive to see whether BOS360 fits their specific needs and growth stage."
          />
          <StepCard
            n="4"
            title="Implementation"
            text="If there’s a fit, the team begins the work toward more clarity, momentum, and health."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14 pt-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <SectionHeader
                eyebrow="PDF Version"
                title="Get a PDF 1-pager to attach and pass along"
                icon={<FileDown className="h-5 w-5" />}
              />
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Download the PDF if you want a simple asset to forward, attach, or keep on hand when introducing Cam.
              </p>
              <p className="mt-2 text-sm text-slate-500">/referral-kit-one-pager.pdf</p>
            </div>
            <a
              href="/referral-kit-one-pager.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-orange-300"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF One Pager
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white md:p-12">
          <h2 className="text-center text-3xl font-bold tracking-tight">Ready to make an introduction?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-slate-300">
            If someone in your network sounds like a fit, a short intro is all it takes to get the conversation started.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:camlillico@gmail.com?subject=Founder%20Introduction&body=Hey%20Cam%2C%0A%0AI%E2%80%99d%20like%20to%20introduce%20you%20to%20someone%20who%20may%20be%20a%20fit.%0A"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Email Intro
            </a>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Book Intro Call
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.
      </footer>
    </main>
  );
}

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 ${className}`}>
      {children}
    </p>
  );
}

function SectionHeader({
  eyebrow,
  title,
  icon,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <div className={`flex items-center gap-3 ${centered ? "justify-center" : "justify-start"}`}>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-700 shadow-sm">
          {icon}
        </span>
        <div>
          <SectionLabel>{eyebrow}</SectionLabel>
        </div>
      </div>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}

function QuickStat({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-lg font-bold text-[#ed7d31]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function HeroPoint({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <p className="text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function QuoteRow({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
      “{text}”
    </div>
  );
}

function MiniCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-900">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function IconCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function StepCard({
  n,
  title,
  text,
  label,
}: {
  n: string;
  title: string;
  text: string;
  label?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-sm font-semibold text-orange-700">
        {n}
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900">{title}</p>
      {label ? <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p> : null}
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function HowToRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-orange-50 text-orange-700">
        {icon}
      </span>
      <div>
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function ScriptCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <CopyButton
          text={text}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Copy
        </CopyButton>
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">{text}</pre>
      </div>
    </div>
  );
}

function LogoTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex min-h-[84px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <img src={src} alt={alt} className="h-9 w-full object-contain" />
    </div>
  );
}
