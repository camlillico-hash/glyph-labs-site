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
    <main className="min-h-screen bg-neutral-950 text-slate-100">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-10 md:pt-14">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              EXECUTIVECOACHING360
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-100 md:text-5xl">
              Cam — BOS360
              <br />
              Coach for Scaling
              <br />
              Founders
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
              Helping leadership teams gain clarity, momentum,
              <br className="hidden sm:block" />
              and health through a proven operating system.
            </p>

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
                className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-neutral-900"
              >
                Get The PDF Version
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40">
              <div className="aspect-[16/10] w-full bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800" />
            </div>
          </div>
        </div>
      </section>

      {/* FOCUS + KEYWORDS */}
      <section className="bg-gradient-to-b from-neutral-950 to-neutral-900/30">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                THE INTRODUCTION
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Focusing on $2M–$50M Founder-Led Companies</h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                BOS360 is a comprehensive business operating system designed to
                bring more focus, transparency, and alignment to growth-stage
                founder-led companies by helping them install a cadence around
                priorities, people, and performance.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                I work directly with founders/leadership teams to implement a
                proven cadence of annual planning, quarterly priorities, weekly
                accountability, and team performance habits. BOS360 is built on
                the principles of EOS, but is structured to match founder-led
                realities.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MiniCard
                  icon={<ClipboardList className="h-4 w-4" />}
                  title="Vision"
                  text="We align around where we’re going and what matters most right now."
                />
                <MiniCard
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Momentum"
                  text="We install rhythms that create weekly progress and compounding execution."
                />
                <MiniCard
                  icon={<BadgeCheck className="h-4 w-4" />}
                  title="Health"
                  text="We improve leadership alignment, accountability, and team performance."
                />
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-200">
                  <Headphones className="h-4 w-4" />
                  <p className="text-sm font-semibold">Listen for Keywords</p>
                </div>

                <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                  <ul className="space-y-3 text-sm text-slate-200">
                    <li>“Growth is chaotic”</li>
                    <li>“I can’t scale past my role”</li>
                    <li>“My team isn’t moving as one”</li>
                    <li>“Things slip through the cracks”</li>
                    <li>“We need to execute consistently”</li>
                    <li>“Our meetings suck”</li>
                    <li>“Lack of accountability”</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY INTRODUCE */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          THE INTRODUCTION
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">Why Introduce Cam?</h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <IconCard icon={<MessageSquareText className="h-5 w-5" />} title="Operator Turned Coach" />
          <IconCard icon={<BookOpenCheck className="h-5 w-5" />} title="High Cadence Coach" />
          <IconCard icon={<BadgeCheck className="h-5 w-5" />} title="Certified Expert" />
          <IconCard icon={<Sparkles className="h-5 w-5" />} title="Motivated and Skilled" />
        </div>
      </section>

      {/* REFERRAL PATH */}
      <section id="referral-path" className="mx-auto max-w-6xl px-6 pb-12 pt-8">
        <h2 className="text-center text-3xl font-bold tracking-tight">The Referral Path</h2>
        <p className="mt-2 text-center text-sm text-slate-400">How intros typically flow from first signal to next steps.</p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StepCard n="1" title="Refer Cam to someone you know" />
          <StepCard n="2" title="Warm Introduction Call" />
          <StepCard n="3" title="Intro Kit & Discovery" />
          <StepCard n="4" title="Engagement" />
        </div>
      </section>

      {/* HOW TO REFER */}
      <section className="bg-neutral-900/20">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            THE INTRODUCTION
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">How to Refer Cam</h2>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-6">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
                <h3 className="text-base font-semibold">Confirm Interest</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Confirm there is interest in a warm introduction. This can be a
                  quick note, a quick text, or a quick call.
                </p>

                <h3 className="mt-6 text-base font-semibold">The Introduction</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Once confirmed, introduce Cam to the founder/leader via email
                  or text.
                </p>

                <h3 className="mt-6 text-base font-semibold">Log the Intro</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Copy the intro into your CRM / note system for your own
                  reference.
                </p>
              </div>
            </div>

            <div className="md:col-span-6">
              <div className="space-y-4">
                <ScriptCard
                  title="" 
                  text={`Hey [Name], I want to introduce you to Cam Lillico.

Cam helps founder-led leadership teams install a simple operating system so they gain clarity, momentum, and health.

[Name] is building [Company] and is currently navigating [context]. I think it’s worth a quick intro call to see if there’s a fit.`}
                />
                <ScriptCard
                  title="" 
                  text={`Hey [Name], introducing you to Cam Lillico.

Cam works with founder-led leadership teams who are hitting the “scaling complexity” phase — lots of activity, but priorities and execution start to get noisy.

Based on what you shared about [trigger moment], I think Cam would be a strong conversation.`}
                />
                <ScriptCard
                  title="" 
                  text={`Hey [Name] — meet Cam Lillico.

Cam helps leadership teams build a practical operating system (BOS360) so they execute with clarity, accountability, and momentum.

If you’re open, here’s his booking link for a quick intro call: ${BOOKING_URL}`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-12">
        <h2 className="text-2xl font-bold tracking-tight">PDF Version to Pass Along</h2>
        <p className="mt-2 text-sm text-slate-400">Download the one-page version you can forward or include in intros.</p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <div>
            <p className="text-sm font-semibold text-slate-200">BOS360 Referral Kit (PDF)</p>
            <p className="mt-1 text-sm text-slate-400">/referral-kit-one-pager.pdf</p>
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
        <div className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 p-8 md:p-12">
          <h2 className="text-center text-3xl font-bold tracking-tight">Make an introduction or book a discovery meeting</h2>
          <p className="mt-3 text-center text-sm text-slate-400">
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
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-neutral-900"
            >
              Book Discovery Call
            </a>
          </div>
        </div>
      </section>
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
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex items-center gap-2 text-slate-200">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/40 text-slate-200">
          {icon}
        </span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}

function IconCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/40 text-slate-200">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-200">{title}</p>
    </div>
  );
}

function StepCard({ n, title }: { n: string; title: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/40 text-sm font-semibold text-slate-200">
        {n}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-200">{title}</p>
    </div>
  );
}

function ScriptCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <CopyButton
          text={text}
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-neutral-900"
        >
          Copy
        </CopyButton>
      </div>
      <pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">{text}</pre>
    </div>
  );
}

function FaqItem({ q }: { q: string }) {
  return (
    <details className="group rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-200">
        <div className="flex items-center justify-between gap-4">
          <span>{q}</span>
          <span className="text-slate-400 transition-transform group-open:rotate-180">⌄</span>
        </div>
      </summary>
    </details>
  );
}
