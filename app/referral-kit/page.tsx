import React from "react";
import {
  ClipboardList,
  Headphones,
  BookOpenCheck,
  ArrowRight,
  FileDown,
  MessageSquareText,
  Sparkles,
  BadgeCheck,
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
      {/* HEADER (light version of /coaching) */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div
            className="inline-flex min-w-0 items-center gap-2"
            aria-label="Cam Lillico Coaching"
          >
            <a
              href="/coaching"
              className="inline-flex items-center"
              aria-label="Cam Lillico Coaching home"
            >
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
              className="rounded-lg border border-cyan-600/40 px-3 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
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

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-10 md:pt-14">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Referral Enablement Tool
            </p>

            <div className="mt-4 max-w-xl rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M12 8.25v.5M12 11v5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Note!</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    This page is meant for you (the helpful referrer) to identify people in your network and do a quick yet meaningful intro for me.
                  </p>
                </div>
              </div>
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
              Referral Kit: Connect Founders to Clarity, Momentum and Health
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-neutral-950 shadow-sm transition-colors hover:bg-orange-300"
              >
                How to Refer Cam
              </a>
              <a
                href="#referral-path"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
              >
                Get The PDF Version
                <FileDown className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="aspect-[16/10] w-full bg-gradient-to-br from-slate-100 via-white to-slate-200" />
            </div>
          </div>
        </div>
      </section>

      {/* FOCUS + KEYWORDS */}
      <section className="bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                THE FRAMEWORK
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Focusing on $2M–$50M Founder-Led Companies</h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                BOS360 is a comprehensive business operating system designed for founders who have successfully reached product-market fit but are now feeling the weight of complexity as they scale.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                I work directly with leadership teams to install a repeatable cadence of accountability, vision alignment, and issue resolution. This isn’t just theory—it’s a practical toolkit for teams generating between $2M and $50M in annual revenue who need to transition from “founder-driven” to “system-driven.”
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MiniCard
                  icon={<ClipboardList className="h-4 w-4" />}
                  title="Vision"
                  text="Getting everyone in your organization aligned with where you are going and how you plan to get there."
                />
                <MiniCard
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Momentum"
                  text="Instilling focus, discipline and accountability throughout the company so that everyone executes on that vision day after day."
                />
                <MiniCard
                  icon={<BadgeCheck className="h-4 w-4" />}
                  title="Health"
                  text="Creating a cohesive leadership team and nourishing a happy high-performing culture where everyone can rise to their full potential."
                />
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                  Does any of this sound familiar?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  These are the kinds of scaling pains founders and leadership teams often experience before they put a better operating system in place.
                </p>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <ul className="list-disc space-y-3 pl-5 text-sm text-slate-700">
                    <li>“We’re growing, but it feels messier than it should.”</li>
                    <li>“Too much still depends on me.”</li>
                    <li>“My leadership team is not fully aligned.”</li>
                    <li>“We meet constantly, but key issues still linger.”</li>
                    <li>“Accountability is inconsistent.”</li>
                    <li>“We’ve hit a ceiling.”</li>
                    <li>“I’m not sure everyone is in the right seat.”</li>
                    <li>“We keep starting initiatives, but they don’t stick.”</li>
                    <li>“Our priorities keep changing.”</li>
                    <li>“We need more clarity on the plan.”</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY INTRODUCE */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          THE BACKGROUND
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Why Introduce Cam?</h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <IconCard
            icon={<MessageSquareText className="h-5 w-5" />}
            title="Operator Turned Coach"
            text="10+ years of hands-on leadership experience in high-growth environments before coaching."
          />
          <IconCard
            icon={<BookOpenCheck className="h-5 w-5" />}
            title="High-Growth Tech"
            text="Deep roots in scaling and exiting high-growth tech firms like Kira Talent and Ten Thousand Coffees."
          />
          <IconCard
            icon={<BadgeCheck className="h-5 w-5" />}
            title="Certified Expert"
            text="Certified BOS360 and EOS implementation specialist with hundreds of hours of team sessions."
          />
          <IconCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Methodical Style"
            text="Known for a trusted, calm, and methodical approach that cuts through the noise of scaling."
          />
        </div>
      </section>

      {/* REFERRAL PATH */}
      <section id="referral-path" className="mx-auto max-w-6xl px-6 pb-12 pt-8">
        <h2 className="text-center text-3xl font-bold tracking-tight">The Referral Path</h2>
        <p className="mt-2 text-center text-sm text-slate-600">A seamless transition for any founder you introduce.</p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StepCard
            n="1"
            title="Refer Cam to someone you know"
            label="Partner Action"
            text="Make the referral (email or LinkedIn intro) and share a bit of context on what they’re navigating."
          />
          <StepCard
            n="2"
            title="Warm Intro Call"
            text="Cam meets with the founder/CEO to confirm fit before booking the discovery call (#3)."
          />
          <StepCard
            n="3"
            title="Free 90-Min Discovery"
            text="A no-obligation deep dive to see if BOS360 fits their specific needs."
          />
          <StepCard
            n="4"
            title="Implementation"
            text="The team begins the journey toward clarity and health."
          />
        </div>
      </section>

      {/* HOW TO REFER */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            ENABLEMENT GUIDE
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">How to Refer Cam</h2>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-base font-semibold">01. Confirm Interest</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Mention Cam and BOS360 during your conversation. If they are feeling the “scaling pain,” they’ll likely be open to it.
                </p>

                <h3 className="mt-6 text-base font-semibold">02. The Introduction</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Start a thread via Email or LinkedIn. You can also invite Cam directly to a discovery call if you are currently working with them.
                </p>

                <h3 className="mt-6 text-base font-semibold">03. Loop Me In</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Once the intro is made, I’ll take it from there and keep you updated on the progress.
                </p>
              </div>
            </div>

            <div className="md:col-span-6">
              <div className="space-y-4">
                <ScriptCard
                  title="Short Script"
                  text={`“Hey [Founder], I recall you mentioning growth feels a bit chaotic lately. You should talk to Cam—he specializes in helping $5M+ teams install a better operating system. Want an intro?”`}
                />
                <ScriptCard
                  title="Medium Script"
                  text={`“I’ve been watching Cam work with other scaling founders. He uses the BOS360 framework to get the whole leadership team on the same page. It cuts through the ‘putting out fires’ cycle. Happy to connect you.”`}
                />
                <ScriptCard
                  title="Strong Script"
                  text={`“You mentioned meetings suck and your team isn’t executing. Cam is an operator turned coach who fixed exactly that for firms like Kira Talent. He’s the real deal for scaling health. You free for a 15-min chat with him?”`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-12">
        <h2 className="text-2xl font-bold tracking-tight">PDF Version to Pass Along</h2>
        <p className="mt-2 text-sm text-slate-600">Download the one-page version you can forward or include in intros.</p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">BOS360 Referral Kit (PDF)</p>
            <p className="mt-1 text-sm text-slate-600">/referral-kit-one-pager.pdf</p>
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
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-4">
        <h2 className="text-center text-2xl font-bold tracking-tight">Common Questions</h2>

        <div className="mx-auto mt-6 max-w-3xl space-y-3">
          <FaqItem q="What projects do you handle?" />
          <FaqItem q="What is the intro process?" />
          <FaqItem q="BOS360 vs EOS?" />
          <FaqItem q="What is the referral structure?" />
          <FaqItem q="Is this only for outgoing companies?" />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12">
          <h2 className="text-center text-3xl font-bold tracking-tight">Make an introduction or book a discovery meeting</h2>
          <p className="mt-3 text-center text-sm text-slate-600">
            Ready to help a founder build momentum? Let’s connect and see if it’s a fit.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-orange-300"
            >
              Send Email Intro
            </a>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
            >
              Book Discovery Call
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER (light version of /coaching) */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.
      </footer>
    </main>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-slate-900">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
        {n}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      {label ? (
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function ScriptCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <CopyButton
          text={text}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Copy
        </CopyButton>
      </div>
      <pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{text}</pre>
    </div>
  );
}

function FaqItem({ q }: { q: string }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
        <div className="flex items-center justify-between gap-4">
          <span>{q}</span>
          <span className="text-slate-500 transition-transform group-open:rotate-180">⌄</span>
        </div>
      </summary>
    </details>
  );
}
